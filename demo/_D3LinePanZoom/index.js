const loadName = 'testLineforD3.json';
d3.json("./data/" + loadName).then(function (data) {
  // Define margin, width, and height
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const width = 460 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Create scales for x and y axes

  const x = d3.scaleLinear()
    .range([0, width]);
  const y = d3.scaleLinear()
    .range([height, 0]);

  x.domain([0, d3.max(data[0], function (d) { return d.x; })]);
  y.domain([0, d3.max(data[0].concat(data[1]), function (d) { return d.y; })]);

  // Create SVG element
  const svg = d3.select("#LibraPlayground")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const graphGroup = svg.append("g")
    ;

  

  const line = d3.line()
    .x(d => x(d.x))
    .y(d => y(d.y));
  const path = graphGroup.selectAll(".line")
    .data(data)
    .enter().append("path")
    .attr("class", "line")
    .attr("d", d => line(d))
    .attr("stroke", "black")
    .attr("stroke-width", "2")
    .attr("fill", "none");

// Add x-axis
const xAxisGroup = svg.append("g")
.attr("class", "x axis")
.attr("transform", "translate(0," + height + ")")
.call(d3.axisBottom(x));

// Add y-axis
const yAxisGroup = svg.append("g")
.attr("class", "y axis")
.attr("transform", "translate(" + 20 + ",0)")
.call(d3.axisLeft(y));

  // Add labels
  svg.append("text")
    .attr("class", "label")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom)
    .style("text-anchor", "middle")
    .text("x");

  svg.append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("y");


  // Create zoom behavior
  const zoom = d3.zoom()
    .scaleExtent([0.1, 10])
    .on("zoom", (event) => {
      const { transform } = event;
      graphGroup.attr("transform", transform);
      // 更新x轴
      xAxisGroup.call(d3.axisBottom(x).scale(event.transform.rescaleX(x)));

      // 更新y轴  
      yAxisGroup.call(d3.axisLeft(y).scale(event.transform.rescaleY(y)));
    });

  // Apply zoom behavior to the SVG container
  svg.call(zoom);
}).catch(function (error) {
  console.log(error);
});