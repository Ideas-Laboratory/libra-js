// global constants
globalThis.MARGIN = { top: 0, right: 0, bottom: 0, left: 0 };
globalThis.WIDTH = 500 - globalThis.MARGIN.left - globalThis.MARGIN.right;
globalThis.HEIGHT = 450 - globalThis.MARGIN.top - globalThis.MARGIN.bottom;
globalThis.FIELD_COLOR = "degree";
globalThis.FIELD_RADIUS = "degree";
globalThis.FISHEYE_LENS = 100;

// global variables
globalThis.data = [];

// shared scales
globalThis.x = null;
globalThis.y = null;

async function loadData() {
  globalThis.data = await d3.json("./data/miserables.json");
  globalThis.data.nodes.forEach(
    (node) =>
      (node.degree = globalThis.data.links.filter(
        (link) => link.target === node.id || link.source === node.id
      ).length)
  );

  globalThis.nodes = globalThis.data.nodes;
  globalThis.links = globalThis.data.links;
  globalThis.links = globalThis.links.map((d, i) => ({ ...d, index: i }));

  d3.forceSimulation(globalThis.nodes)
    .force("charge", d3.forceManyBody().strength(-100))
    .force(
      "link",
      d3
        .forceLink(globalThis.links)
        .id((d) => d.id)
        .distance(0)
        .strength(0.3)
    )
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .force(
      "center",
      d3.forceCenter(
        (globalThis.WIDTH - globalThis.MARGIN.left - globalThis.MARGIN.right) /
          2 +
          globalThis.MARGIN.left,
        (globalThis.HEIGHT - globalThis.MARGIN.top - globalThis.MARGIN.bottom) /
          2 +
          globalThis.MARGIN.top
      )
    )
    .stop()
    .tick(200);
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
    .attr("viewbox", `0 0 ${globalThis.WIDTH} ${globalThis.HEIGHT}`);

  // Add color scale
  const extentColor = [
    0,
    d3.max(globalThis.nodes, (d) => d[globalThis.FIELD_COLOR]),
  ];
  globalThis.color = d3
    .scaleDiverging()
    .domain([
      extentColor[1],
      (extentColor[1] - extentColor[0]) / 2 + extentColor[0],
      extentColor[0],
    ])
    .interpolator(d3.interpolateRdYlGn);

  // Add radius scale
  const extentRadius = d3.extent(
    globalThis.nodes,
    (d) => d[globalThis.FIELD_RADIUS]
  );
  globalThis.radius = d3.scaleLinear().domain(extentRadius).range([3, 10]);
}

module.exports = {
  loadData,
  renderStaticVisualization,
};
