$(document).ready(function(){

	$("#search").click(function(){
		
		var searchterm = $("#term").val();
		// var searchterm = "benlcollins";

		$.get("https://api.github.com/users/" + searchterm, function(data, status){
			console.log(status);
			var userData = data;
			if (status === "success") {
				// console.log(userData);

				function addUserData() {
					var username = "<li>Username: " + userData.login + "</li>";
					var repos = "<li>Number of public repos: " + userData.public_repos + "</li>";
					var repoURL = "<li>Repos URL: <a href='https://api.github.com/users/" + userData.login + "/repos'>" + 
						userData.repos_url + "</a></li>";
					
					$("ul").empty(); // clear out any previous displays
					
					$("#userDetails").append(username, repos, repoURL);  // add the new data

					$("#userDetails").append("<button id='searchRepo'>View Repos?</button>");
				}
				addUserData();
				
			}

			$("#searchRepo").click(function(){

				$.get("https://api.github.com/users/" + searchterm + "/repos", function(data, status){
					console.log(status);
					var repoData = data;
					console.log(data);
					if (status === "success") {
						$("#repoDetails").prepend("<h3>Repos:</h3>");
						for (var i = 0; i < repoData.length; i++) {
							$("#repoDetails").append("<li id='repo" + i + "'>" + repoData[i].name + "</li>");
						};

					}; // end of if statment

					$("#repoDetails").children().click(function(){
						var repoChoice = $("#"+this.id).html();

						$.get("https://api.github.com/repos/" + searchterm + "/" + repoChoice + "/languages", function(data, status){
							console.log(status);
							var langData = data;
							if (status === "success") {
								// rawDataD3 = langData;
								// console.log(rawDataD3);

								// start of d3

								// basic SVG setup
								var margin = {top: 20, right: 20, bottom: 30, left: 50};           
								var width = 600 - margin.left - margin.right;
								var height= 500 - margin.top - margin.bottom;
								var w = width;
								var h = height;

								var keys = Object.keys(langData);
								var dataset = [];
								for (var j = 0; j < keys.length; j++ ) {
									var item = new Object();
									item.key = keys[j];
									item.value = langData[keys[j]];
									dataset.push(item);
								};

								var xScale = d3.scale.ordinal()
								    .domain(dataset.map(function (d) {return d.key; }))
								    .rangeRoundBands([margin.left, width], 0.05);

								var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

								var yScale = d3.scale.linear()
								    .domain([0, d3.max(dataset, function(d) {return d.value; })])
								    .range([h - margin.bottom,0]);

								var yAxis = d3.svg.axis().scale(yScale).orient("left");


								//Create SVG element
								var svg = d3.select("body")
								    .append("svg")
								    .attr("width", w)
								    .attr("height", h);

								//Create bars
								svg.selectAll("rect")
								    .data(dataset)
								.enter().append("rect")
								    .attr("x", function(d, i) {
								        return xScale(d.key);
								    })
								    .attr("y", function(d) {
								        return yScale(d.value);
								    })
								    .attr("width", xScale.rangeBand())
								    .attr("height", function(d) {
								        return h - yScale(d.value) - margin.bottom;
								    })
								    .attr("fill", "steelblue");

								svg.append("g")
								    .attr("class", "x axis")
								    .attr("transform", "translate(0," + (h - margin.bottom) + ")")
								    .call(xAxis);

								svg.append("g")
								    .attr("class", "y axis")
								    .attr("transform","translate(" + margin.left + ",0)")
								    .call(yAxis);


								// end of d3

							};

						}); // end of ajax call for github repo language details
					}); // end of click function on repo Details

				}); // end of ajax call for github repos
			});	// end of click function on searchRepo

		});  // end of ajax call to github
	});  // end of click function on search

	$("#clear").click(function(){
		$("li").remove();
		$("h3").remove();
		$("#searchRepo").remove();
		// $("ul").fadeOut();
		d3.selectAll("svg").remove();
	});


});  // end of document ready