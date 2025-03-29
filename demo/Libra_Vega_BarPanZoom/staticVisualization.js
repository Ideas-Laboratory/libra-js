// global variables
globalThis.vegaSpec = {};

async function loadData() {
  globalThis.vegaSpec = {
    $schema: "https://vega.github.io/schema/vega/v5.json",
    description: "A basic bar chart with brushing",
    width: 200,
    height: 200,
    padding: 5,
    data: [
      {
        name: "source",
        url: "data/testBar.json",
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
        name: "xRange",
        init: "[0, width]",
      },
    ],
    scales: [
      {
        name: "x",
        type: "band",
        domain: { data: "source", field: "x" },
        range: { signal: "xRange" },
        padding: 0.1,
      },
      {
        name: "y",
        type: "linear",
        zero: true,
        domain: { data: "source", field: "y" },
        range: "height",
      },
    ],
    axes: [
      { scale: "x", orient: "bottom", title: "x" },
      { scale: "y", orient: "left", titlePadding: 5, title: "y" },
    ],
    marks: [
      {
        name: "marks",
        type: "rect",
        from: { data: "source" },
        encode: {
          update: {
            x: { scale: "x", field: "x" },
            width: { scale: "x", band: 1, offset: -1 },
            y: { scale: "y", field: "y" },
            y2: { scale: "y", value: 0 },
            fill: { value: "steelblue" },
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
}

module.exports = {
  loadData,
  renderStaticVisualization,
};
