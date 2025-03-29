// global constants
globalThis.MARGIN = { top: 20, right: 0, bottom: 30, left: 40 };
globalThis.WIDTH = 500 - globalThis.MARGIN.left - globalThis.MARGIN.right;
globalThis.HEIGHT = 380 - globalThis.MARGIN.top - globalThis.MARGIN.bottom;

// global variables
globalThis.data = [];

// shared scales
globalThis.x = null;
globalThis.y = null;

async function loadData() {
  const alphabet = {
    A: 8.1,
    B: 1.4,
    C: 2.7,
    D: 4.2,
    E: 12.7,
    F: 2.2,
    G: 2.0,
    H: 6.0,
    I: 6.9,
    J: 0.1,
    K: 0.7,
    L: 4.0,
    // M: 0.02406,
    // N: 0.06749,
    // O: 0.07507,
    // P: 0.01929,
    // Q: 0.00095,
    // R: 0.05987,
    // S: 0.06327,
    // T: 0.09056,
    // U: 0.02758,
    // V: 0.00978,
    // W: 0.0236,
    // X: 0.0015,
    // Y: 0.01974,
    // Z: 0.00074,
  };

  globalThis.data = [];
  Object.keys(alphabet).forEach((key) => {
    globalThis.data.push({
      name: key,
      value: alphabet[key],
    });
  });
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

  // Add X axis
  globalThis.x = d3
    .scaleBand()
    .domain(globalThis.data.map((d) => d.name))
    .range([0, globalThis.WIDTH])
    .padding(0.1);
  svg
    .append("g")
    .attr("transform", "translate(0," + globalThis.HEIGHT + ")")
    .call(d3.axisBottom(globalThis.x).tickSizeOuter(0))
    .call((g) =>
      g
        .selectAll(".tick line")
        .clone()
        .attr("stroke-opacity", 0.1)
        .attr("y2", -globalThis.HEIGHT)
    );

  // Add Y axis
  globalThis.y = d3
    .scaleLinear()
    .domain([0, d3.max(globalThis.data, (d) => d.value)])
    .nice()
    .range([globalThis.HEIGHT, 0]);
  svg
    .append("g")
    .call(d3.axisLeft(globalThis.y))
    .call((g) =>
      g
        .selectAll(".tick line")
        .clone()
        .attr("stroke-opacity", 0.1)
        .attr("x2", globalThis.WIDTH)
    );
}

module.exports = {
  loadData,
  renderStaticVisualization,
};
