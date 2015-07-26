$(document).ready(function(){

	$("#search").click(function(){

		// clear out previous results if needed
		clearCanvas();

		// find out the searchterm
		var searchterm = $("#term").val() ? $("#term").val() : "github";

		// get user
		function getUserData(callback) {
			$.get("https://api.github.com/users/" + searchterm, 
				function(data, status){
					console.log(status);
					success: callback(data, status);
			});
		};

		// get repos
		function getUserRepos(callback){
			$.get("https://api.github.com/users/" + searchterm + "/repos", 
				function(data, status){
					console.log(status);
					success: callback(data,status);
			});
		};

		// get languages
		function getRepoLanguages(callback,repo){
			$.get("https://api.github.com/repos/" + searchterm + "/" + repo + "/languages", 
				function(data, status){
						console.log(status);
						success: callback(data,status,repo);
			});
		};

		// callback function to show user
		function showUser(data, status){
		    console.log(status);
		    var username = "<h3>" + data.login + "</h3>";
		    $("#username").append(username);
		    // debugger;
		};

		// callback function to show repos
		function showRepos(data, status){
			console.log(status);
			for (var i = 0; i < data.length; i++) {
				$("#repoDetails").append("<li id='repo" + i + "'>" + data[i].name + "</li>");
			};

			// function when user clicks a repo choice
			$("#repoDetails").children().click(function(){
				
				// clear out any prior details - no longer required
				// $("#langDetails").children().remove();

				// get the chosen repo id by reference to the id of the element in list that was clicked
				var repoChoice = $("#"+this.id).html();

				// call the languages function to get data for chosen repo
				getRepoLanguages(showLangs, repoChoice);

			});
		};

		// callback function to show languages
		function showLangs(data, status,repo){

			// setup empty dataset array variable for d3
			var dataset = [];

			// loop through data object and append items to li
			for (var key in data) {
  			if (data.hasOwnProperty(key)) { // ensure it is key from data, not prototype being used
  				
  				// code to display language counts as list - not used at moment
  				// $("#langDetails").append("<li>" + key + ": " + data[key] + "</li>");
  				
  				// push items into dataset array
  				var item = new Object();
					item.key = key;
					item.value = data[key];
					dataset.push(item);
  			};
  		};
  		console.log(dataset); // for checking
  		
  		// update the d3 chart

  		// update the x scale
			xScale.domain(dataset.map(function (d) {return d.key; }))
			  .rangeRoundBands([margin.left, w], 0.05);

			// update the y scale
			yScale.domain([0, d3.max(dataset, function(d) {return d.value; })])
			  .range([h,margin.top]);

			// update the x axis
			xAxis.scale(xScale).orient("bottom");

			// update the y axis
			yAxis.scale(yScale).orient("left");

			//Create bars and labels
		  bars = svg.selectAll("rect").data(dataset);
		  barLabels = svg.selectAll("text").data(dataset);

		  // add new bars
		  bars.enter()
	      .append("rect")
	      .attr("x", function(d, i) {
		      return xScale(d.key);
		    })
		    .attr("y", function(d) {
		      return yScale(d.value);
		    })
		    .attr("width", xScale.rangeBand())
		    .attr("height", function(d) {
		      return h - yScale(d.value);
		    })
		    .attr("fill", "steelblue");

			// remove bars as necessary
			bars.exit()
	      .transition()
	      .duration(500)
	      .attr("x", w)
	      .remove();

		  // update the bars
			bars.transition()
		    .duration(750)
		    .attr("x", function(d,i) {
		      return xScale(d.key);
		    })
		    .attr("y", function(d) {
		      return yScale(d.value);
		    })
		    .attr("width", xScale.rangeBand())
		    .attr("height", function(d) {
		      return h - yScale(d.value);
		    });

		  // update the x axis
			svg.select(".xaxis")
				.transition()
				.duration(750)
		    .call(xAxis);

			// update the y axis
			svg.select(".yaxis")
				.transition()
				.duration(750)
				.call(yAxis);

			// update the title
			svg.select(".chartTitle")
				.text(repo);

			// add tooltip
			bars.on("mouseover",function(d){
				
				// add blank tooltip
				svg.append("text")
					.attr("id","tooltip");

				// get the x and y coords
				var xPosition = parseFloat(d3.select(this).attr("x")) + xScale.rangeBand()/2;
				var yPosition = parseFloat(d3.select(this).attr("y")) + 18;

				// add the tooltip
				svg.select("#tooltip")
					.attr("x",xPosition)
					.attr("y",function(){
						// if value is less than 10% of max, show tooltip above bar
						var mx = d3.max(dataset, function(d) {return d.value; });
						if (d.value < 0.1 * mx) {
							return yPosition - 22;
						} else {
							return yPosition;
						};
					})
					.attr("text-anchor","middle")
					.attr("fill",function(){
						// if value is less than 10% of max, make tooltip black
						var mx = d3.max(dataset, function(d) {return d.value; });
						if (d.value < 0.1 * mx) {
							return "black";
						} else {
							return "white";
						};
					})
					.attr("font-family","sans-serif")
					.attr("font-size","12px")
					.text(d.value);

			})
			.on("mouseout",function(){
				d3.select("#tooltip").remove();
			});

		}; // end of the showLangs function


		// call the user and repos functions
		getUserData(showUser);
		getUserRepos(showRepos);

		
		// setup for the d3 chart
		// basic SVG setup
		var dataset = [];
		var margin = {top: 70, right: 20, bottom: 60, left: 100};           
		var w = 600 - margin.left - margin.right;
		var h = 500 - margin.top - margin.bottom;

		//Create SVG element
		var svg = d3.select("div#chart")
	    .append("svg")
	    .attr("width", w + margin.left + margin.right)
	    .attr("height", h + margin.top + margin.bottom);

	  // define the x scale
		var xScale = d3.scale.ordinal()
	    .domain(dataset.map(function (d) {return d.key; }))
	    .rangeRoundBands([margin.left, w], 0.05);

		// define the x axis
		var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

		// define the y scale
		var yScale = d3.scale.linear()
	    .domain([0, d3.max(dataset, function(d) {return d.value; })])
	    .range([h,margin.top]);

		// define the y axis
		var yAxis = d3.svg.axis().scale(yScale).orient("left");

		// draw the x axis
		svg.append("g")
	    .attr("class", "xaxis")
	    .attr("transform", "translate(0," + h + ")")
	    .call(xAxis);

		// draw the y axis
		svg.append("g")
	    .attr("class", "yaxis")
	    .attr("transform","translate(" + margin.left + ",0)")
	    .call(yAxis);

		// add the x axis label
		svg.append("text")
			.attr("class", "x axis label")
			.attr("text-anchor", "middle")
			.attr("transform", "translate(" + (w / 2) + "," + (h + (margin.bottom / 2) + 10) + ")")
			.text("Language");

		// add the y axis label
		svg.append("text")
			.attr("class", "y axis label")
			.attr("text-anchor", "middle")
			.attr("transform", "translate(15," + (h / 2) + ")rotate(-90)")
			.text("Number of characters");


		// add a title to the chart
		svg.append("text")
			.attr("class", "chartTitle")
			.attr("text-anchor", "middle")
			.attr("transform", "translate(" + (w / 2) + ",20)")
			.text("GitHub Repo");

		

	}); // end of search click function

	// respond to click on clear button
	$("#clear").click(function(){
		$("#term").val(''); // extra detail to clear out input box
		clearCanvas();
	});

	// clear the elements out
	var clearCanvas = function(){
		$("li").remove(); // clear out list items
		$("h3").remove(); // clear out username heading
		$("h4").remove(); // clear out heading "Repos"
		$("#searchRepo").remove(); // clear out button
		d3.selectAll("svg").remove(); // clear out chart
		
	};
});


