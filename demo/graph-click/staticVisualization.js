// global constants
globalThis.WIDTH = 500;
globalThis.HEIGHT = 520;
globalThis.VIEW_LAYOUTS = {
  nodelink: {
    offset: { x: 0, y: 0 },
    width: globalThis.WIDTH,
    height: globalThis.HEIGHT,
    margin: { top: 0, right: 30, bottom: 12, left: 50 },
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
    .attr("style", "display:block")
    .attr("width", globalThis.WIDTH)
    .attr("height", globalThis.HEIGHT)
    .attr("viewbox", `0 0 ${globalThis.WIDTH} ${globalThis.HEIGHT}`);

  // Calculate the global scales
  const extentRadius = d3.extent(globalThis.data.nodes, (d) => d["degree"]);
  globalThis.radius = d3.scaleLinear().domain(extentRadius).range([3, 10]);

  // Draw links but not nodes
  const g = svg
    .append("g")
    .attr(
      "transform",
      `translate(${globalThis.VIEW_LAYOUTS.nodelink.margin.left}, ${globalThis.VIEW_LAYOUTS.nodelink.margin.top})`
    );
  g.selectAll("line")
    .data(globalThis.data.links)
    .join("line")
    .attr("class", "mark")
    .attr("x1", (d) => d.source.x)
    .attr("y1", (d) => d.source.y)
    .attr("x2", (d) => d.target.x)
    .attr("y2", (d) => d.target.y)
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.3);
}

module.exports = {
  loadData,
  renderStaticVisualization,
};
