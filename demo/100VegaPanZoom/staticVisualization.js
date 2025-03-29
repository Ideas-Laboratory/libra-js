// global variables
globalThis.vegaSpec = {};

const loadName = window.location.search.split('file=')[1].split('&')[0];

async function loadData() {
  globalThis.vegaSpec = {
    $schema: "https://vega.github.io/schema/vega/v5.json",
    description:
      "A basic scatter plot example depicting automobile statistics.",
    width: 300,
    height: 300,
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

    signals: [
      {
        name: "xDom",
        init: "extent(pluck(data('source'), 'x'))",
      },
      {
        name: "yDom",
        init: "extent(pluck(data('source'), 'y'))",
      },
    ],

    scales: [
      {
        name: "x",
        type: "linear",
        zero: false,
        domain: { signal: "xDom" },
        range: "width",
      },
      {
        name: "y",
        type: "linear",
        zero: false,
        domain: { signal: "yDom" },
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
        clip: true,
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
  const { view } = await vega(
    document.getElementById("LibraPlayground"),
    globalThis.vegaSpec
  );
  globalThis.vegaView = view;
  globalThis.x = view.scale("x");
  globalThis.y = view.scale("y");
}

module.exports = {
  loadData,
  renderStaticVisualization,
};
