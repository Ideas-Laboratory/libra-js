// global variables
globalThis.data = [];
globalThis.vegaSpec = {};

async function loadData() {
  globalThis.data = await d3.csv(
    "./data/bls-metro-unemployment.csv",
    d3.autoType
  );
  globalThis.vegaSpec = {
    $schema: "https://vega.github.io/schema/vega/v5.json",
    description: "A basic line chart example.",
    width: 500,
    height: 300,
    padding: 5,

    data: [
      {
        name: "table",
        values: globalThis.data,
      },
    ],

    scales: [
      {
        name: "x",
        type: "time",
        range: "width",
        domain: { data: "table", field: "date" },
      },
      {
        name: "y",
        type: "linear",
        range: "height",
        nice: true,
        zero: true,
        domain: { data: "table", field: "unemployment" },
      },
    ],

    axes: [
      { orient: "bottom", scale: "x" },
      { orient: "left", scale: "y" },
    ],

    marks: [
      {
        name: "marks",
        type: "group",
        from: {
          facet: {
            name: "series",
            data: "table",
            groupby: "division",
          },
        },
        marks: [
          {
            type: "line",
            from: { data: "series" },
            encode: {
              enter: {
                x: { scale: "x", field: "date" },
                y: { scale: "y", field: "unemployment" },
                stroke: { value: "steelblue" },
                strokeWidth: { value: 1 },
                fill: { value: "none" },
              },
            },
          },
        ],
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
