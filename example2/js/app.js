// array of events
var events = [
	{id: "2985400682", sha: "e34cdda9fff7d68cfa0197c28ed69ae706721cd9"},
	{id: "2985397832", sha: "47c849e29df41c3c3ec83a32c7337eebefd572c8"},
	{id: "2984031811", sha: "e34cdda9fff7d68cfa0197c28ed69ae706721cd9"},
	{id: "2984018363", sha: "bc39455d155b324a250dabf4a0e1c93a76697a35"},
	{id: "2984006103", sha: "e34711a7a833d261566d221bdafcbe2fce88e88d"},
	{id: "2984002003", sha: "b99d8a1a2a76bc83eaad7dd8575d7a5acc0e3c3f"}
];

$(document).ready(function(){
	$("#search").click(function(){

		// var searchterm = $("#username").val() + "/" + $("#reponame").val();
		var searchterm = "benlcollins/github_api_viz"

		function getJSON(url) {
			return get(url).then(JSON.parse);
		}

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
						console.log(item.id, "This id has no commits");
					};
				});
				// console.log(dataset);

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
						// console.log(deletions);
						// problem is that this is part of the loop, so additions/deletions arrays grow by 1 each iteration

						// could do some d3 stuff here?

						// update the scales
						xScale.domain([0,d3.max(stats, function(d,i){ return i; })])
							.range([margin.left,w]);

						yScale.domain([d3.min(stats, function(d){ return d.deletions; }),
							d3.max(stats, function(d){ return d.additions; })])

						// update the axes
						xAxis.scale(xScale);
						yAxis.scale(yScale);

						// create bars
						bars = svg.selectAll("rect").data(stats);

						// add new bars
						bars.enter()
							.append("rect")
							.attr("x", function(d,i){
								return xScale(i);
							})
							.attr("y", function(d,i){
								return yScale(d.additions);
							})
							.attr("width", function(d,i) {
								return xScale(i);
							})
							.attr("height", function(d){
								return h - yScale(d.additions);
							})
							.attr("fill","steelblue");

						// remove bars as necessary

						// bars update and transition

						// update the axes on the charts
						svg.select("#xaxis")
							.transition()
							.duration(1000)
							.call(xAxis);

						svg.select("#yaxis")
							.transition()
							.duration(1000)
							.call(yAxis);

					});
				});
			}, function(error){
				console.log("FAILED!!", error);
		});
	});

	// setup for the d3 chart
	// dimensions setup
	var dataArray = [];
	var margin = {top: 70, right: 20, bottom: 60, left: 100};           
	var w = 600 - margin.left - margin.right;
	var h = 500 - margin.top - margin.bottom;

	// define the svg element
	var svg = d3.select("div#chart")
		.append("svg")
		.attr("width", w + margin.left + margin.right)
		.attr("height", h + margin.top + margin.bottom);

	// define the scales
	var xScale = d3.scale.linear()
		.domain([0, d3.max(dataArray, function(d,i){ return i; })])
		.range([margin.left, w]);

	var yScale = d3.scale.linear()
		.domain([d3.min(dataArray, function(d){ return d.deletions; }), 
			d3.max(dataArray, function(d){ return d.additions; })])
		.range([h,margin.top]);

	// define the axes
	var xAxis = d3.svg.axis().scale(xScale);
	var yAxis = d3.svg.axis().scale(yScale).orient("left");

	// draw the axes
	svg.append("g")
		.attr("class","xaxis")
		.attr("transform","translate(0,"+ h + ")")
		.call(xAxis);

	svg.append("g")
		.attr("class","yaxis")
		.attr("transform","translate(" + margin.left + ",0)")
		.call(yAxis);		

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