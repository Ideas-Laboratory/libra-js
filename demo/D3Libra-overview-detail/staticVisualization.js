// global constants
globalThis.MARGIN = { top: 30, right: 10, bottom: 50, left: 70 };
globalThis.WIDTH = 764 - globalThis.MARGIN.left - globalThis.MARGIN.right;
globalThis.HEIGHT = 532 - globalThis.MARGIN.top - globalThis.MARGIN.bottom;

// global variables
globalThis.data = [];

// shared scales
globalThis.x = null;
globalThis.y = null;

const loadName = window.location.search.split('file=')[1].split('&')[0];


async function loadData() {
  globalThis.data = (await d3.csv("./data/stocks/" + loadName, d3.autoType));
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
    .attr(
      "viewbox",
      `0 0 ${globalThis.WIDTH + globalThis.MARGIN.left + globalThis.MARGIN.right
      } ${globalThis.HEIGHT + globalThis.MARGIN.top + globalThis.MARGIN.bottom}`
    )
    .append("g")
    .attr(
      "transform",
      "translate(" + globalThis.MARGIN.left + "," + globalThis.MARGIN.top + ")"
    );

  // Add X axis
  globalThis.x = d3
    .scaleUtc()
    .domain(d3.extent(globalThis.data, (d) => d.Date))
    .range([0, globalThis.WIDTH]);

  // Add Y axis
  globalThis.yOverview = d3
    .scaleLinear()
    .domain([0, d3.max(globalThis.data, (d) => d.Close)])
    .range([globalThis.HEIGHT * 0.3, 0]);

  globalThis.yDetail = d3
    .scaleLinear()
    .domain([0, d3.max(globalThis.data, (d) => d.Close)])
    .range([globalThis.HEIGHT * 0.6, 0]);
}

module.exports = {
  loadData,
  renderStaticVisualization,
};
