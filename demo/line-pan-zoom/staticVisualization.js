// global constants
globalThis.MARGIN = { top: 20, right: 20, bottom: 30, left: 30 };
globalThis.WIDTH = 728;
globalThis.HEIGHT = 500;

// global variables
globalThis.data = [];

// shared scales
globalThis.x = null;
globalThis.y = null;
globalThis.groups = null;

async function loadData() {
  globalThis.data = (await d3.csv("./data/bls-metro-unemployment.csv", d3.autoType))
}

function renderStaticVisualization() {
  // Create the positional scales.
  globalThis.x = d3.scaleUtc()
    .domain(d3.extent(globalThis.data, d => d.date))
    .range([globalThis.MARGIN.left, globalThis.WIDTH - globalThis.MARGIN.right]);

  globalThis.y = d3.scaleLinear()
    .domain([0, d3.max(globalThis.data, d => d.unemployment)]).nice()
    .range([globalThis.HEIGHT - globalThis.MARGIN.bottom, globalThis.MARGIN.top]);

  // Create the SVG container.
  const svg = d3.select('#LibraPlayground').append("svg")
    .attr("width", globalThis.WIDTH)
    .attr("height", globalThis.HEIGHT)
    .attr("viewBox", [0, 0, globalThis.WIDTH, globalThis.HEIGHT]);
}

module.exports = {
  loadData,
  renderStaticVisualization,
};
