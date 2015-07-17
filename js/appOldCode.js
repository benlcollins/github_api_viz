// OLD CODE

// This was my initial code to validate the idea, here for reference...

// It's horrible, nested, spaghetti code that probably 
// has you throwing up on your keyboard right about now.

// Forgive me, I'm learning.

// I've refactored the code in the file app.js, now much cleaner.


$(document).ready(function(){

	// setupChart();
	$("#search").click(function(){
		
		clearCanvas();
		var searchterm = $("#term").val();

		$.get("https://api.github.com/users/" + searchterm, function(data, status){
			console.log(status);

			var userData = data;
			if (status === "success") {

				function addUserData() {
					var username = "<h3>" + userData.login + " has " 
						+ userData.public_repos + " public repos:</h3><br>";
					
					$("ul").empty(); // clear out any previous displays
					
					$("#username").append(username);  // add the new data
				};

				addUserData();

				$.get("https://api.github.com/users/" + searchterm + "/repos", function(data, status){
					console.log(status);
					var repoData = data;
					console.log(data);
					if (status === "success") {
						for (var i = 0; i < repoData.length; i++) {
							$("#repoDetails").append("<li id='repo" + i + "'>" + repoData[i].name + "</li>");
						};

					}; // end of if statment

				// setup for d3 charting
				// basic SVG setup
				var dataset = [];
				var margin = {top: 70, right: 20, bottom: 60, left: 100};           
				var width = 600 - margin.left - margin.right;
				var height= 500 - margin.top - margin.bottom;
				var w = width;
				var h = height;

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

				// add the y axis label
				svg.append("text")
						.attr("class", "y axis label")
						.attr("text-anchor", "middle")
						.attr("transform", "translate(15," + (h / 2) + ")rotate(-90)")
						.text("Number of characters");

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

				// add a title to the chart
				svg.append("text")
						.attr("class", "chartTitle")
						.attr("text-anchor", "middle")
						.attr("transform", "translate(" + (w / 2) + ",20)")
						.text("GitHub Repo");


				// function to handle click on any of the repo names in the list
				// it redraws (or draws first time) the chart
				$("#repoDetails").children().click(function(){
					
					// get the chosen repo id by reference to the id of the element in list that was clicked
					var repoChoice = $("#"+this.id).html();
				

					// go grab the language details for that repo from github api
					$.get("https://api.github.com/repos/" + searchterm + "/" + repoChoice + "/languages", function(data, status){
						console.log(status);

						// assign the returned data to variable called langData
						var langData = data;

						// if api call was successful, put the returned data object into an array of objects
						// e.g. [{key: "JavaScript", value: 20532}, {key: "HTML", value: 4978}]
						if (status === "success") {
							dataset = [];
							var keys = Object.keys(langData);
							
							for (var j = 0; j < keys.length; j++ ) {
								var item = new Object();
								item.key = keys[j];
								item.value = langData[keys[j]];
								dataset.push(item);
							};

							// update the x scale
							xScale.domain(dataset.map(function (d) {return d.key; }))
							    .rangeRoundBands([margin.left, width], 0.05);

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
									.text(repoChoice);

							// end of d3

							};

						}); // end of ajax call for github repo language details
					}); // end of click function on repo Details

				}); // end of ajax call for github repos
			};  // end of if statement if the github api call is successful and returns user info
		});  // end of ajax call to github
	});  // end of click function on search

	// respond to click on clear button by calling the clearCanvas button
	$("#clear").click(function(){
		$("#term").val(''); // extra detail to clear out input box
		clearCanvas();
	});

	// function to clear the elements out
	var clearCanvas = function(){
		$("li").remove(); // clear out list items
		$("h3").remove(); // clear out username heading
		$("h4").remove(); // clear out heading "Repos"
		$("#searchRepo").remove(); // clear out button
		d3.selectAll("svg").remove(); // clear out chart
		
	};

});






