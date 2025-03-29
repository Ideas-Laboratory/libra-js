// global constants
globalThis.MARGIN = { top: 30, right: 70, bottom: 40, left: 60 };
globalThis.WIDTH = 500 - globalThis.MARGIN.left - globalThis.MARGIN.right;
globalThis.HEIGHT = 380 - globalThis.MARGIN.top - globalThis.MARGIN.bottom;
globalThis.FIELD_X = "Horsepower";
globalThis.FIELD_Y = "Miles_per_Gallon";
globalThis.FIELD_COLOR = "Origin";

// global variables
globalThis.data = [];

// shared scales
globalThis.x = null;
globalThis.y = null;
globalThis.color = null;

async function loadData() {
  globalThis.data = (await d3.json("./data/cars.json")).filter(
    (d) => !!(d["Horsepower"] && d["Miles_per_Gallon"])
  );
}

function renderStaticVisualization() {
  const plot = Plot.dot(globalThis.data, { x: globalThis.FIELD_X, y: globalThis.FIELD_Y }).plot()

  document.getElementById('LibraPlayground').appendChild(plot);
}

module.exports = {
  loadData,
  renderStaticVisualization,
};
