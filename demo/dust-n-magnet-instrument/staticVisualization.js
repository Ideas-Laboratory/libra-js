// global constants
globalThis.MARGIN = { top: 0, right: 0, bottom: 0, left: 0 };
globalThis.WIDTH = 800 - globalThis.MARGIN.left - globalThis.MARGIN.right;
globalThis.HEIGHT = 600 - globalThis.MARGIN.top - globalThis.MARGIN.bottom;

// global variables
globalThis.data = [];

// shared scales
globalThis.x = null;
globalThis.y = null;

async function loadData() {
  globalThis.data = await d3.json("./data/cars.json");
  globalThis.magnet = [];

  const datum = globalThis.data[0];
  globalThis.properties = [];
  for (const property in datum) {
    const value = datum[property];
    if (typeof value === "number") {
      globalThis.properties.push(property);
      // initialize 3 magnets
      if (globalThis.magnet.length < 3) {
        globalThis.magnet.push({
          x:
            globalThis.WIDTH / 2 -
            Math.pow(-1, globalThis.magnet.length) *
              (globalThis.WIDTH / 2 - 100),
          y:
            globalThis.HEIGHT / 2 -
            Math.pow(-1, Math.floor(globalThis.magnet.length / 2)) *
              (globalThis.HEIGHT / 2 - 100),
          property,
        });
      }
    }
  }

  globalThis.data = globalThis.data.slice(0, 50).map((d) => ({
    ...d,
    x: globalThis.WIDTH / 2,
    y: globalThis.HEIGHT / 2,
  }));
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
}

module.exports = {
  loadData,
  renderStaticVisualization,
};
