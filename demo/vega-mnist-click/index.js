const spec = {
  $schema: "https://vega.github.io/schema/vega/v5.json",
  width: 500,
  height: 400,
  padding: { top: 30, right: 80, bottom: 40, left: 60 },
  autosize: "none",

  signals: [
    {
      name: "selectedLabel",
      value: null,
      on: [
        {
          events: "click",
          update:
            "datum && datum.label === selectedLabel ? null : datum ? datum.label : selectedLabel",
        },
      ],
    },
  ],

  data: [
    {
      name: "mnist",
      url: "data/mnist_tsne.json",
    },
    {
      name: "legend",
      values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    },
  ],

  scales: [
    {
      name: "x",
      type: "linear",
      domain: { data: "mnist", field: "x" },
      range: "width",
      nice: true,
      zero: false,
    },
    {
      name: "y",
      type: "linear",
      domain: { data: "mnist", field: "y" },
      range: "height",
      nice: true,
      zero: false,
    },
    {
      name: "color",
      type: "ordinal",
      domain: { data: "legend", field: "data" },
      range: { scheme: "tableau10" },
    },
  ],

  marks: [
    {
      type: "symbol",
      from: { data: "mnist" },
      encode: {
        enter: {
          x: { scale: "x", field: "x" },
          y: { scale: "y", field: "y" },
          size: { value: 30 },
        },
        update: {
          fill: [
            {
              test: "selectedLabel === null",
              value: "lightgray",
            },
            {
              test: "datum.label === selectedLabel",
              scale: "color",
              field: "label",
            },
            { value: "lightgray" },
          ],
          fillOpacity: [
            {
              test: "selectedLabel === null",
              value: 0.7,
            },
            {
              test: "datum.label === selectedLabel",
              value: 0.7,
            },
            { value: 0.3 },
          ],
        },
      },
    },
    {
      type: "text",
      encode: {
        enter: {
          x: { value: 460 },
          y: { value: 0 },
          text: { value: "label" },
          fontSize: { value: 12 },
          fontWeight: { value: "bold" },
          fill: { value: "black" },
        },
      },
    },
    {
      type: "symbol",
      from: { data: "legend" },
      encode: {
        enter: {
          x: { value: 450 },
          y: { signal: "datum.data * 20 + 20" },
          fill: { scale: "color", field: "data" },
          size: { value: 50 },
        },
      },
    },
    {
      type: "text",
      from: { data: "legend" },
      encode: {
        enter: {
          x: { value: 460 },
          y: { signal: "datum.data * 20 + 25" },
          text: { field: "data" },
          fontSize: { value: 12 },
          fill: { value: "black" },
          align: { value: "left" },
        },
      },
    },
  ],
};

vega(document.getElementById("LibraPlayground"), spec);
