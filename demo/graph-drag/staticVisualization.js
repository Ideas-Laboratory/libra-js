// global constants
globalThis.WIDTH = 500;
globalThis.HEIGHT = 520;
globalThis.VIEW_LAYOUTS = {
  nodelink: {
    offset: { x: 0, y: 0 },
    width: globalThis.WIDTH,
    height: globalThis.HEIGHT,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  },
};

// global variables
globalThis.data = [];
globalThis.extent = [0, 0];

// shared scales
globalThis.radius = null;

async function loadData() {
  globalThis.data = await d3.json("./data/miserables.json");
  globalThis.data.nodes.forEach(
    (node) =>
      (node.degree = globalThis.data.links.filter(
        (link) => link.target === node.id || link.source === node.id
      ).length)
  );
  d3.forceSimulation(globalThis.data.nodes)
    .force("charge", d3.forceManyBody().strength(-100))
    .force(
      "link",
      d3
        .forceLink(globalThis.data.links)
        .id((d) => d.id)
        .distance(0)
        .strength(0.3)
    )
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .force(
      "center",
      d3.forceCenter(
        (globalThis.VIEW_LAYOUTS.nodelink.width -
          globalThis.VIEW_LAYOUTS.nodelink.margin.left -
          globalThis.VIEW_LAYOUTS.nodelink.margin.right) /
          2 +
          globalThis.VIEW_LAYOUTS.nodelink.margin.left,
        (globalThis.VIEW_LAYOUTS.nodelink.height -
          globalThis.VIEW_LAYOUTS.nodelink.margin.top -
          globalThis.VIEW_LAYOUTS.nodelink.margin.bottom) /
          2 +
          globalThis.VIEW_LAYOUTS.nodelink.margin.top
      )
    )
    .stop()
    .tick(200);
  globalThis.extent = [
    0,
    d3.max(globalThis.data.nodes, (d) => d["degree"]) + 1,
  ];
}

function renderStaticVisualization() {
  // append the svg object to the body of the page
  const svg = d3
    .select("#LibraPlayground")
    .append("svg")
    .style("border", "1px solid black")
    .style("display", "block")
    .attr("width", globalThis.WIDTH)
    .attr("height", globalThis.HEIGHT)
    .attr("viewbox", `0 0 ${globalThis.WIDTH} ${globalThis.HEIGHT}`);

  // Calculate the global scales
  const extentRadius = d3.extent(globalThis.data.nodes, (d) => d["degree"]);
  globalThis.radius = d3.scaleLinear().domain(extentRadius).range([3, 10]);
}

module.exports = {
  loadData,
  renderStaticVisualization,
};
