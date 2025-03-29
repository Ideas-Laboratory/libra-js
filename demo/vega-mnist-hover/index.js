const spec = {
  $schema: "https://vega.github.io/schema/vega/v5.json",
  width: 500,
  height: 400,
  padding: { top: 30, right: 80, bottom: 40, left: 60 },

  data: [
    {
      name: "mnist",
      url: "data/mnist_tsne.json",
    },
  ],

  scales: [
    {
      name: "x",
      type: "linear",
      domain: { data: "mnist", field: "x" },
      range: "width",
      nice: true,
      zero: true,
    },
    {
      name: "y",
      type: "linear",
      domain: { data: "mnist", field: "y" },
      range: "height",
      nice: true,
      zero: true,
    },
    {
      name: "color",
      type: "ordinal",
      domain: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      range: { scheme: "tableau10" },
    },
  ],

  marks: [
    {
      name: "points",
      type: "symbol",
      from: { data: "mnist" },
      encode: {
        enter: {
          x: { scale: "x", field: "x" },
          y: { scale: "y", field: "y" },
          fill: { scale: "color", field: "label" },
          size: { value: 30 },
        },
        update: {
          fillOpacity: { value: 0.7 },
        },
        hover: {
          fillOpacity: { value: 1.0 },
        },
      },
    },
    {
      name: "tooltip",
      type: "image",
      from: { data: "mnist" },
      encode: {
        enter: {
          width: { value: 140 },
          height: { value: 140 },
          align: { value: "center" },
          baseline: { value: "bottom" },
        },
        update: {
          url: { field: "image" },
          x: { signal: "datum.x ? scale('x', datum.x) : 0" },
          y: { signal: "datum.y ? scale('y', datum.y) - 50 : 0" },
          opacity: { value: 0 },
        },
        hover: {
          opacity: { value: 1 },
        },
      },
    },
  ],

  legends: [
    {
      fill: "color",
      title: "label",
      orient: "right",
      offset: 0,
    },
  ],
};

vega(document.getElementById("LibraPlayground"), spec);
