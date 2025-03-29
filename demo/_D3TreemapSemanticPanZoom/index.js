// global constants
globalThis.MARGIN = { top: 30, right: 70, bottom: 40, left: 60 };
globalThis.WIDTH = 500 - globalThis.MARGIN.left - globalThis.MARGIN.right;
globalThis.HEIGHT = 380 - globalThis.MARGIN.top - globalThis.MARGIN.bottom;

// global variables
globalThis.data = [];
globalThis.data_detail_level2 = [];
globalThis.data_detail_level1 = [];
globalThis.data_detail_level0 = [];

// shared scales
globalThis.x = null;
globalThis.y = null;



d3.json("./data/flare-2.json").then((data) => {

  globalThis.dataRoot = d3
    .hierarchy(data)
    .sum(function (d) {
      return d.value;
    })
    .sort((a, b) => b.height - a.height || b.value - a.value);

  globalThis.dataRoot.children.map((node, index) => (node.groupId = index));

  d3.treemap().size([globalThis.WIDTH, globalThis.HEIGHT]).padding(0.5)(
    globalThis.dataRoot
  );

  globalThis.data_detail_level1 = [globalThis.dataRoot].flatMap(
    (node) => node.children || [node]
  );
  globalThis.data_detail_level2 = globalThis.data_detail_level1.flatMap(
    (node) => node.children || [node]
  );
  globalThis.data_detail_level3 = globalThis.data_detail_level2.flatMap(
    (node) => node.children || [node]
  );


  globalThis.dataSet = []
  
  globalThis.dataSet.push(globalThis.data_detail_level1);
  globalThis.dataSet.push(globalThis.data_detail_level2);
  globalThis.dataSet.push(globalThis.data_detail_level3);

  const svg = d3
    .select("#LibraPlayground")
    .append("svg")
    .attr(
      "width",
      globalThis.WIDTH + globalThis.MARGIN.left + globalThis.MARGIN.right
    )
    .attr(
      "height",
      globalThis.HEIGHT + globalThis.MARGIN.top + globalThis.MARGIN.bottom
    )
    .attr("viewbox", `0 0 ${globalThis.WIDTH} ${globalThis.HEIGHT}`)
    .append("g")
    .attr(
      "transform",
      "translate(" + globalThis.MARGIN.left + "," + globalThis.MARGIN.top + ")"
    );

  // Add x axis
  globalThis.x = d3.scaleLinear().domain([0, 1]).range([0, 1]);

  // Add y axis
  globalThis.y = d3.scaleLinear().domain([0, 1]).range([0, 1]);

  

  function drawTreemap(data) {
    svg.selectAll(".block").remove()
   // Draw the treemap
  svg.selectAll(".block")
    .data(data)
    .join("g")
    .attr("class", "block")
    .call((g) =>
      g
        .append("rect")
        .attr("fill", "blue")
        .attr("x", function (d) {
          return globalThis.x(d.x0);
        })
        .attr("y", function (d) {
          return globalThis.y(d.y0);
        })
        .attr("width", function (d) {
          return globalThis.x(d.x1) - globalThis.x(d.x0);
        })
        .attr("height", function (d) {
          return globalThis.y(d.y1) - globalThis.y(d.y0);
        })
    )
    .call((g) =>
      g
        .append("text")
        .attr("x", function (d) {
          return globalThis.x(d.x0) + 5;
        }) // +10 to adjust position (more right)
        .attr("y", function (d) {
          return globalThis.y(d.y0) + 20;
        }) // +20 to adjust position (lower)
        .text(function (d) {
          return d.data.name;
        })
        .attr("font-size", "15px")
        .attr("fill", "white")
    );
  }
  drawTreemap(globalThis.data_detail_level1)
  // Create zoom behavior
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  const zoom = d3.zoom()
  .scaleExtent([0.1, 10])
  .on("zoom", (event) => {
    const { transform } = event;
    drawTreemap(globalThis.dataSet[clamp(Math.floor(transform.k),0,2)])
    svg.selectAll("rect")
      .attr("transform", transform);
    svg.selectAll("text")
      .attr("transform", transform);

  });

  // Apply zoom behavior to the SVG container
  svg.call(zoom);

})

