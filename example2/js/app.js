$(document).ready(function(){
	$("#search").click(function(){

		// var searchterm = $("#username").val() + "/" + $("#reponame").val();
		var searchterm = "benlcollins/javascript_experiments";

		function getJSON(url) {
			return get(url).then(JSON.parse);
		};

		function get(url){
			return new Promise(function(resolve,reject){
				var req = new XMLHttpRequest();
				req.open('GET',url);
				req.onload = function() {
					if (req.status == 200){
						resolve(req.response);
					}
					else {
						reject(Error(req.statusText));
					}
				};
				req.onerror = function() {
					reject(Error("Network Error"));
				};
				req.send();
			});
		};

		getJSON("https://api.github.com/repos/" + searchterm + "/events")
			.then(function(response){
				// console.log("Success");
				var dataset = [];
				var stats = [];
				var sequence = Promise.resolve();

				response.forEach(function(item){
					if (item.payload.commits) {
						var obj = {};
						obj.id = item.id;
						obj.message = item.payload.commits[0].message;
						obj.url = item.payload.commits[0].url;
						dataset.push(obj);
						// console.log(item.id, item.payload.commits[0].url);
					} 
					else {
						console.log(item.id, " has no commits");
					};
				});
				// console.log(dataset);


				var dataArray = [];
				var margin = {top: 50, right: 20, bottom: 20, left: 50};           
				var w = 600 - margin.left - margin.right;
				var h = 500 - margin.top - margin.bottom;

				// define the svg element
				var svg = d3.select("div#chart")
					.append("svg")
					.attr("width", w + margin.left + margin.right)
					.attr("height", h + margin.top + margin.bottom);

				// do some work on the dataset here
				dataset.forEach(function(item){
					sequence = sequence.then(function(){
						// console.log(item, 1);
						return getJSON(item.url);
					}).then(function(commit) {
						// console.log(commit.stats);
						var obj = {};
						obj.id = item.id;
						obj.additions = commit.stats.additions;
						obj.deletions = commit.stats.deletions == 0 ? 0 : -commit.stats.deletions;
						// console.log(obj);
						stats.push(obj);
						return stats;
					}).then(function(){
						console.log(stats);
						// debugger;
						// console.log(deletions);
						// problem is that this is part of the loop, so additions/deletions arrays grow by 1 each iteration

						// setup for the d3 chart
						// dimensions setup
						
						var additionsDeletions = [];
						stats.forEach(function(d){ return additionsDeletions.push([d.additions,d.deletions]);});
						var flattened = additionsDeletions.reduce(function(a,b){ return a.concat(b); });

						

						// define the scales
						var xScale = d3.scale.ordinal()
							.domain(stats.map(function(d){ return d.id; }))
							.rangeRoundBands([margin.left, w], 0.5);

						var yScale = d3.scale.linear()
							.domain(d3.extent(flattened, function(d){ return d; }))
							.range([h,margin.top]);

						// define the axes
						var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
						var yAxis = d3.svg.axis().scale(yScale).orient("left");

						// draw the axes
						svg.append("g")
								.attr("class","xaxis")
							.append("line")
								.attr("y1",yScale(0))
								.attr("y2",yScale(0))
								.attr("x1",margin.left)
								.attr("x2",w);

						svg.append("g")
							.attr("class","yaxis")
							.attr("transform","translate(" + margin.left + ",0)")
							.call(yAxis);

						// add the y axis label
						svg.append("text")
							.attr("class", "y axis label")
							.attr("text-anchor", "middle")
							.attr("transform", "translate(15," + (h / 2) + ")rotate(-90)")
							.text("Lines of code added/deleted");

						// add the x axis label
						svg.append("text")
							.attr("class", "x axis label")
							.attr("text-anchor", "middle")
							.attr("transform", "translate(" + (w / 2) + "," + (h + (margin.bottom / 2) + 10) + ")")
							.text("Commit ID");

						// add a title to the chart
						svg.append("text")
							.attr("class", "chartTitle")
							.attr("text-anchor", "middle")
							.attr("transform", "translate(" + (w / 2) + ",20)")
							.text("GitHub Repo");


						// the dynamic stuff
						// update the scales
						xScale.domain(stats.map(function(d){ return d.id; }))
							.rangeRoundBands([margin.left,w], 0.05);

						yScale.domain(d3.extent(flattened, function(d){ return d; }));

						// update the axes
						xAxis.scale(xScale);
						yAxis.scale(yScale);

						// create bars
						bars = svg.selectAll("rect").data(stats);
						// barLabels = svg.selectAll("text").data(stats);

						// add new bars
						bars.enter()
							.append("rect")
							.attr("x", function(d,i){
								return xScale(d.id);
							})
							.attr("y", function(d,i){
								return yScale(d.additions);
							})
							.attr("width", function(d,i) {
								return xScale.rangeBand();
							})
							.attr("height", function(d){
								// debugger;
								return yScale(0) - yScale(d.additions);
							})
							.attr("fill","steelblue");

						bars.enter()
							.append("rect")
							.attr("x", function(d,i){
								return xScale(d.id);
							})
							.attr("y", function(d,i){
								return yScale(0);
							})
							.attr("width", function(d,i) {
								return xScale.rangeBand();
							})
							.attr("height", function(d){
								return yScale(0) - yScale(-d.deletions);
							})
							.attr("fill","indianred");

						// update the bars
						bars.transition()
					    .duration(750)
					    .attr("x", function(d,i) {
					      return xScale(d.id);
					    })
					    .attr("width", xScale.rangeBand());

					  // barsDown.transition()
					  //   .duration(750)
					  //   .attr("x", function(d,i) {
					  //     return xScale(d.id);
					  //   })
					  //   .attr("y", function(d) {
					  //     return yScale(0);
					  //   })
					  //   .attr("width", xScale.rangeBand())
					  //   .attr("height", function(d) {
					  //     return yScale(0) - yScale(-d.deletions);
					  //   });

						// add commit id labels
						// barLabels.enter()
						// 	.append("text")
						// 	.attr("x",function(d,i){
						// 		return xScale(d.id);
						// 	})
						// 	.attr("width", function(d,i) {
						// 		return xScale.rangeBand();
						// 	})
						// 	.attr("y",h)
						// 	.attr("text-anchor","middle")
						// 	.text(function(d){
						// 		return d.id;
						// 	});



						// update the axes on the charts
						svg.select("#xaxis")
							.transition()
							.duration(1000)
							.call(xAxis);

						svg.select("#yaxis")
							.transition()
							.duration(1000)
							.call(yAxis);

						var repo = $("#reponame").val();

						// update the title
						svg.select(".chartTitle")
							.text(repo);

					});
				});
			}, function(error){
				console.log("FAILED!!", error);
		});
	});

	

});


// Workings

// response[0].payload.commits[0].message
// response[0].payload.commits[0].url

// 'https://api.github.com/repos/benlcollins/github_api_viz/commits/' + events[5].sha

// var dataset = [];

// function getCommit(callback,commit){
// 	$.get("https://api.github.com/repos/benlcollins/github_api_viz/commits/" 
// 		+ commit, function(data,status){
// 			// console.log(status);
// 			success: callback(data,status);
// 	});
// };

// function showStats(data,status){
// 	var commitData = {};
// 	commitData["sha"] = data.sha;
// 	commitData["additions"] = data.stats.additions;
// 	commitData["deletions"] = data.stats.deletions;

// 	dataset.push(commitData);
// 	console.log(dataset);

// };

// getCommit(showStats,"e34cdda9fff7d68cfa0197c28ed69ae706721cd9");

// for (i=0; i < events.length; i++) {
// 	getCommit(showStats,events[i].sha);
	
// };