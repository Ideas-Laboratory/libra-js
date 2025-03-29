// global constants
globalThis.WIDTH = 500;
globalThis.HEIGHT = 520;
globalThis.NODE_LINK_PROPORTION = 0.8;
globalThis.NODE_LINK_MAIN_PROPORTION = 0.9;
globalThis.NODE_LINK_COLOR_BAR_PROPORTION =
  1 - globalThis.NODE_LINK_MAIN_PROPORTION;
globalThis.HISTOGRAM_PROPORTION = 1 - globalThis.NODE_LINK_PROPORTION;
globalThis.VIEW_LAYOUTS = {
  nodelink: {
    offset: { x: 0, y: 0 },
    width: globalThis.WIDTH,
    height: globalThis.HEIGHT * globalThis.NODE_LINK_PROPORTION,
    margin: { top: 0, right: 30, bottom: 12, left: 50 },
  },
  histogram: {
    offset: { x: 0, y: globalThis.HEIGHT * globalThis.NODE_LINK_PROPORTION },
    width: globalThis.WIDTH,
    height: globalThis.HEIGHT * globalThis.HISTOGRAM_PROPORTION,
    margin: { top: 10, right: 30, bottom: 50, left: 50 },
  },
};

// global variables
globalThis.data = [];
globalThis.extent = [0, 0];

// shared scales
globalThis.x = null;
globalThis.y = null;
globalThis.color = null;
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
    .attr("viewbox", `0 0 width height`);

  // append the style of the widget
  d3.select("#LibraPlayground").append("style").text(`
  input[type="range"] {
    border-radius: 20px;
    background-color: orange;
    -webkit-appearance: none;
    overflow: hidden
  }

  input[type="range"]::-webkit-slider-runnable-track {
    -webkit-appearance: none;
  }

  input[type='range']::-webkit-slider-thumb {
    width: 10px;
    border-radius: 20px;
    -webkit-appearance: none;
    height: 10px;
    cursor: ew-resize;
    background: black;
    box-shadow: -999px 0 0 999px lightgray;
  }
  `);

  // Calculate the global scales
  const extentColor = globalThis.extent;
  globalThis.color = d3
    .scaleDiverging()
    .domain([
      extentColor[1],
      (extentColor[1] - extentColor[0]) / 2 + extentColor[0],
      extentColor[0],
    ])
    .interpolator(d3.interpolateRdYlGn);
  const extentRadius = d3.extent(globalThis.data.nodes, (d) => d["degree"]);
  globalThis.radius = d3.scaleLinear().domain(extentRadius).range([3, 10]);

  // Render the color map
  const colorbarLayout = {
    offset: { x: 0, y: 0 },
    width: globalThis.VIEW_LAYOUTS.nodelink.width,
    height: globalThis.VIEW_LAYOUTS.nodelink.height,
    margin: {
      top: 20,
      right: 5,
      bottom: 30,
      left:
        5 +
        globalThis.VIEW_LAYOUTS.nodelink.width -
        globalThis.VIEW_LAYOUTS.nodelink.margin.right,
    },
  };

  const domain = globalThis.color.domain();
  const graidentID = "gradient";
  const colorMap = svg.append("g");
  const gradient = colorMap
    .append("defs")
    .append("linearGradient")
    .attr("id", graidentID);

  gradient.attr("x1", 0).attr("x2", 0).attr("y1", 0).attr("y2", 1);

  let newDomain = domain;
  newDomain.forEach((value, i) => {
    gradient
      .append("stop")
      .attr("offset", `${(i / (domain.length - 1)) * 100}%`)
      .attr("stop-color", globalThis.color(value));
  });

  colorMap
    .append("text")
    .attr(
      "x",
      colorbarLayout.margin.left +
        globalThis.VIEW_LAYOUTS.nodelink.margin.right / 2
    )
    .attr("y", colorbarLayout.margin.top - 5)
    .text("Degree")
    .attr("font-size", "10px")
    .attr("font-family", "sans-serif")
    .attr("fill", "black")
    .attr("text-anchor", "end")
    .text(globalThis.extent[1]);

  colorMap
    .append("text")
    .attr(
      "x",
      colorbarLayout.margin.left +
        globalThis.VIEW_LAYOUTS.nodelink.margin.right / 2
    )
    .attr("y", colorbarLayout.height - colorbarLayout.margin.bottom + 15)
    .text("Degree")
    .attr("font-size", "10px")
    .attr("font-family", "sans-serif")
    .attr("fill", "black")
    .attr("text-anchor", "end")
    .text(globalThis.extent[0]);

  colorMap
    .append("rect")
    .attr("x", colorbarLayout.margin.left)
    .attr("y", colorbarLayout.margin.top)
    .attr(
      "width",
      colorbarLayout.width -
        colorbarLayout.margin.left -
        colorbarLayout.margin.right
    )
    .attr(
      "height",
      colorbarLayout.height -
        colorbarLayout.margin.top -
        colorbarLayout.margin.bottom
    )
    .attr("fill", `url(#${graidentID})`);

  // Render the histogram view
  const histogramView = svg.append("g");
  histogramView
    .attr(
      "transform",
      `translate(${globalThis.VIEW_LAYOUTS.histogram.offset.x}, ${globalThis.VIEW_LAYOUTS.histogram.offset.y})`
    )
    .attr("class", "histogramView");

  const key = "degree";
  const { width, height, margin } = globalThis.VIEW_LAYOUTS.histogram;
  const padding = 1;

  const extent = globalThis.extent;
  const bin = d3
    .bin()
    .domain(extent)
    .value((d) => d[key]);
  bin.thresholds(d3.ticks(extent[0], extent[1] + 1, extent[1] - extent[0]));
  const binnedData = bin(globalThis.data.nodes);
  binnedData[binnedData.length - 1].x1++;

  const scaleX = d3
    .scaleLinear()
    .domain(extent)
    .range([margin.left, width - margin.right]);
  const scaleY = d3
    .scaleLinear()
    .domain([0, d3.max(binnedData, (d) => d.length)])
    .range([height - margin.bottom, margin.top])
    .nice();

  const histogramBackground = histogramView.append("g");
  // groups
  const groupAxisX = histogramBackground
    .append("g")
    .attr("class", "groupAxisX")
    .attr("transform", `translate(${0}, ${height - margin.bottom})`);
  const groupAxisY = histogramBackground
    .append("g")
    .attr("class", "groupAxisY")
    .attr("transform", `translate(${margin.left}, ${0})`);
  const groupTitle = histogramBackground
    .append("g")
    .attr("class", "title")
    .attr("transform", `translate(${width / 2}, ${height - margin.bottom})`);
  // draw things except main layer
  groupAxisX.call(d3.axisBottom(scaleX));
  groupAxisY
    .call(d3.axisLeft(scaleY))
    .call((g) =>
      g
        .selectAll(".tick line")
        .clone()
        .attr("stroke-opacity", 0.1)
        .attr("x2", width - margin.left - margin.right)
    )
    .call((g) =>
      g.selectAll(".tick").each(function (node, i) {
        if (i % 2 === 1) d3.select(this).select("text").remove();
      })
    );
  groupTitle
    .append("text")
    .text("degree of nodes")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr(
      "y",
      groupAxisX.node().getBBox().height + groupTitle.node().getBBox().height
    );

  histogramView
    .append("g")
    .selectAll("rect")
    .data(binnedData)
    .join("rect")
    .attr("fill", "steelblue")
    .attr("x", (d, i) => scaleX(d.x0) + padding)
    .attr("y", (d) => scaleY(d.length))
    .attr("width", (d, i) => scaleX(d.x1) - scaleX(d.x0) - 2 * padding)
    .attr("height", (d) => scaleY(0) - scaleY(d.length));
}

module.exports = {
  loadData,
  renderStaticVisualization,
};
