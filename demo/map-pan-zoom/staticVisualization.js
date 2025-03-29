// global constants
globalThis.MARGIN = { top: 0, right: 0, bottom: 0, left: 0 };
globalThis.WIDTH = 1000 - globalThis.MARGIN.left - globalThis.MARGIN.right;
globalThis.HEIGHT = 400 - globalThis.MARGIN.top - globalThis.MARGIN.bottom;

// global variables
globalThis.data = [];

// shared scales
globalThis.x = null;
globalThis.y = null;

async function loadData() {
  const nc = await d3.json("./data/ncmap_pop_density_topojson.json");
  globalThis.data = topojson.feature(nc, nc.objects.ncmap).features;
}

function renderStaticVisualization() {
  // append the svg object to the body of the page
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
}

module.exports = {
  loadData,
  renderStaticVisualization,
};
