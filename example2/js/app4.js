// array of events
var stats = [
	{id: "2985400682", additions: 323, deletions: -9},
	{id: "2985397832", additions: 45, deletions: -46},
	{id: "2984031811", additions: 10, deletions: -17},
	{id: "2984018363", additions: 111, deletions: -80},
	{id: "2984006103", additions: 89, deletions: 0},
	{id: "2984002003", additions: 216, deletions: -90}
];

// Code to output the stats array but only on last iteration of loop
// var i = 0;

// $(document).ready(function(){
// 	$("#search").click(function(){

// 		// do some work on the dataset here
// 		function outer(cb){
// 			stats.forEach(function(){
// 				if (i == stats.length - 1) {
// 					cb(stats);	
// 				}
// 				i++;
// 			});
// 		};

// 		function callback(array) {
// 			console.log(array);
// 		};

// 		outer(callback);
// 	});
// });

// +++++++++++++++++++++++++++++++++++++++++++++++++++

$(document).ready(function(){
	$("#search").click(function(){

		var searchterm = $("#username").val() + "/" + $("#reponame").val();
		// var searchterm = "benlcollins/javascript_experiments";

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


				// do some work on the dataset here
				function outer(cb){
					var i = 0;
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
							// console.log(i);
							
							var additionsDeletions = [];
							stats.forEach(function(d){ return additionsDeletions.push([d.additions,d.deletions]);});
							var flattened = additionsDeletions.reduce(function(a,b){ return a.concat(b); });
							
							if (i == dataset.length - 1) {
								cb(stats,flattened);	
							}
							i++;

						});
					});	
				};
				
				function callback(array1,array2) {
					console.log(array1,array2);
					// do the d3 stuff in here

					// define the scales
var xScale = d3.scale.ordinal()
	.domain(array1.map(function(d) { return d.id; }))
	.rangeRoundBands([margin.left, w], 0.5);

var yScale = d3.scale.linear()
	.domain(d3.extent(array2, function(d){ return d; }))
	.range([h,margin.top]);

// define the axes
var xAxis = d3.svg.axis()
	.scale(xScale)
	.orient("bottom");

var yAxis = d3.svg.axis()
	.scale(yScale)
	.orient("left");

// draw the x axis
svg.append("g")
  	.attr("class", "xaxis")
  .append("line")
		.attr("y1",yScale(0))
		.attr("y2",yScale(0))
		.attr("x1",margin.left)
		.attr("x2",w);

// draw the y axis
svg.append("g")
  .attr("class", "yaxis")
  .attr("transform","translate(" + margin.left + ",0)")
  .call(yAxis);

// setup bar variables
var bars = svg.selectAll("rect").data(array1);

// add new bars
bars.enter()
	.append("rect")
	.attr("x", function(d){
		return xScale(d.id);
	})
	.attr("y", function(d){
		return yScale(d.additions);
	})
	.attr("width", function(d) {
		return xScale.rangeBand();
	})
	.attr("height", function(d){
		// debugger;
		return yScale(0) - yScale(d.additions);
	})
	.attr("fill","steelblue");

bars.enter()
	.append("rect")
	.attr("x", function(d){
		return xScale(d.id);
	})
	.attr("y", function(d){
		return yScale(0);
	})
	.attr("width", function(d) {
		return xScale.rangeBand();
	})
	.attr("height", function(d){
		// debugger;
		return yScale(0) - yScale(-d.deletions);
	})
	.attr("fill","indianred");




				};


				var margin = {top: 50, right: 20, bottom: 20, left: 50};           
				var w = 600 - margin.left - margin.right;
				var h = 500 - margin.top - margin.bottom;

				// define the svg element
				var svg = d3.select("div#chart")
					.append("svg")
					.attr("width", w + margin.left + margin.right)
					.attr("height", h + margin.top + margin.bottom);

				outer(callback);

			}, function(error){
				console.log("FAILED!!", error);
		});
	});

	

});



