// global constants
globalThis.MARGIN = { top: 30, right: 70, bottom: 40, left: 60 };
globalThis.WIDTH = 500 - globalThis.MARGIN.left - globalThis.MARGIN.right;
globalThis.HEIGHT = 380 - globalThis.MARGIN.top - globalThis.MARGIN.bottom;
globalThis.FIELD_X = "x";
globalThis.FIELD_Y = "y";
globalThis.FIELD_COLOR = "Origin";

// global variables
globalThis.data = [];

// shared scales
globalThis.x = null;
globalThis.y = null;
globalThis.color = null;

const loadName = window.location.search.split('file=')[1].split('&')[0];

async function loadData() {
  globalThis.data = (await d3.json("./data/" + loadName)).filter(
    (d) => !!(d["x"] && d["y"])
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
