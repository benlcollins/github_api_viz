
// array of events
var stats = [
	{id: "2985400682", additions: 323, deletions: -9},
	{id: "2985397832", additions: 45, deletions: -46},
	{id: "2984031811", additions: 10, deletions: -17},
	{id: "2984018363", additions: 111, deletions: -80},
	{id: "2984006103", additions: 89, deletions: 0},
	{id: "2984002003", additions: 216, deletions: -90}
];

var additionsDeletions = [];
stats.forEach(function(d){ return additionsDeletions.push([d.additions,d.deletions]);});
var flattened = additionsDeletions.reduce(function(a,b){ return a.concat(b); });

// setup for the d3 chart
// dimensions setup
var margin = {top: 20, right: 20, bottom: 20, left: 50};           
var w = 600 - margin.left - margin.right;
var h = 500 - margin.top - margin.bottom;

// d3.select("body").append("p").text("Testing this out");
// d3.select("body").append("p").text("what is going on?");

// define the svg element
var svg = d3.select("div#chart")
		.append("svg")
		.attr("width", w + margin.left + margin.right)
		.attr("height", h + margin.top + margin.bottom);

// define the scales
var xScale = d3.scale.ordinal()
	.domain(stats.map(function(d) { return d.id; }))
	.rangeRoundBands([margin.left, w], 0.5);

var yScale = d3.scale.linear()
	.domain(d3.extent(flattened, function(d){ return d; }))
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
var bars = svg.selectAll("rect").data(stats);

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

















