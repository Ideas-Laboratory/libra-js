// global variables
globalThis.vegaSpec = {};

const loadName = window.location.search.split('file=')[1].split('&')[0];

async function loadData() {
  globalThis.vegaSpec = {
    $schema: "https://vega.github.io/schema/vega/v5.json",
    description:
      "A basic scatter plot example depicting automobile statistics.",
    width: 200,
    height: 200,
    padding: 5,

    data: [
      {
        name: "source",
        url: "data/" + loadName,
        transform: [
          {
            type: "filter",
            expr: "datum['x'] != null && datum['y'] != null",
          },
        ],
      },
    ],

    scales: [
      {
        name: "x",
        type: "linear",
        round: true,
        nice: true,
        zero: true,
        domain: { data: "source", field: "x" },
        range: "width",
      },
      {
        name: "y",
        type: "linear",
        round: true,
        nice: true,
        zero: true,
        domain: { data: "source", field: "y" },
        range: "height",
      }
    ],

    axes: [
      {
        scale: "x",
        grid: true,
        domain: false,
        orient: "bottom",
        tickCount: 5,
        title: "x",
      },
      {
        scale: "y",
        grid: true,
        domain: false,
        orient: "left",
        titlePadding: 5,
        title: "y",
      },
    ],



    marks: [
      {
        name: "marks",
        type: "symbol",
        from: { data: "source" },
        encode: {
          update: {
            x: { scale: "x", field: "x" },
            y: { scale: "y", field: "y" },
            shape: { value: "circle" },
            strokeWidth: { value: 2 },
            opacity: { value: 0.5 },
            stroke: { value: "#4682b4" },
            fill: { value: "transparent" },
          },
        },
      },
    ],
  };
}

async function renderStaticVisualization() {
  // render vega spec on screen
  await vega(document.getElementById("LibraPlayground"), globalThis.vegaSpec);
}

module.exports = {
  loadData,
  renderStaticVisualization,
};
