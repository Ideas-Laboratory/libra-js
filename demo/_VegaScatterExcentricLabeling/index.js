const loadName = 'test100.json';

var spec = {
  $schema: "https://vega.github.io/schema/vega/v5.json",
  description:
    "A basic scatter plot example depicting automobile statistics.",
  width: 380,
  height: 380,
  padding: 5,
  "signals": [
    {
      "name": "cursorY",
      "update": "0",
      "on": [
        {
          "events": "pointermove",
          "update": "invert('y', clamp(y(), 0, height))"
        }
      ]
    },
    {
      "name": "cursorX",
      "update": "0",
      "on": [
        {
          "events": "pointermove",
          "update": "invert('x', clamp(x(), 0, width))"
        }
      ]
    }
  ],
  data: [
    {
      name: "source",
      url: "data/cars.json",
      transform: [
        {
          type: "filter",
          expr: "datum['Horsepower'] != null && datum['Miles_per_Gallon'] != null && datum['Acceleration'] != null",
        }
      ],
    },
    {
      "name": "selected",
      "source": "source",
      "transform": [
        {
          "type": "filter",
          "expr": "sqrt(pow(scale('x', datum['Horsepower']) - scale('x', cursorX), 2) + pow(scale('y', datum['Miles_per_Gallon']) - scale('y', cursorY), 2)) <= 25"
        },
        {
          "type": "window",
          "ops": ["row_number"],
          "as": ["index"]
        }
      ]
    }
  ],

  scales: [
    {
      name: "x",
      type: "linear",
      round: true,
      nice: true,
      zero: true,
      domain: { data: "source", field: "Horsepower" },
      range: "width",
    },
    {
      name: "y",
      type: "linear",
      round: true,
      nice: true,
      zero: true,
      domain: { data: "source", field: "Miles_per_Gallon" },
      range: "height",
    },
    {
      name: "size",
      type: "linear",
      round: true,
      nice: false,
      zero: true,
      domain: { data: "source", field: "Acceleration" },
      range: [4, 361],
    },
  ],

  axes: [
    {
      scale: "x",
      grid: true,
      domain: false,
      orient: "bottom",
      tickCount: 5,
      title: "Horsepower",
    },
    {
      scale: "y",
      grid: true,
      domain: false,
      orient: "left",
      titlePadding: 5,
      title: "Miles_per_Gallon",
    },
  ],

  legends: [
    {
      size: "size",
      title: "Acceleration",
      format: "s",
      symbolStrokeColor: "#4682b4",
      symbolStrokeWidth: 2,
      symbolOpacity: 0.5,
      symbolType: "circle",
    },
  ],

  marks: [
    {
      name: "marks",
      type: "symbol",
      from: { data: "source" },
      encode: {
        update: {
          x: { scale: "x", field: "Horsepower" },
          y: { scale: "y", field: "Miles_per_Gallon" },
          size: { scale: "size", field: "Acceleration" },
          shape: { value: "circle" },
          strokeWidth: { value: 2 },
          opacity: { value: 0.5 },
          stroke: { value: "#4682b4" },
          fill: { value: "transparent" },
        },
      },
    },
    {
      type: "symbol",
      encode: {
        update: {
          x: { "scale": "x", "signal": "cursorX" },
          y: { "scale": "y", "signal": "cursorY" },
          size: { "value": 2000 },
          shape: { value: "circle" },
          strokeWidth: { value: 2 },
          stroke: { value: "firebrick" },
          fill: { value: "transparent" },
        },
      },
    },
    {
      type: "symbol",
      from: { data: "selected" },
      encode: {
        update: {
          x: { scale: "x", field: "Horsepower" },
          y: { scale: "y", field: "Miles_per_Gallon" },
          size: { scale: "size", field: "Acceleration" },
          shape: { value: "circle" },
          strokeWidth: { value: 2 },
          opacity: { value: 0.5 },
          stroke: { value: "#4682b4" },
          fill: { value: "red" },
        },
      },
    },
    {
      "name": "labels",
      "type": "text",
      "from": { "data": "selected" },
      "encode": {
        "enter": {
          "fill": { "value": "#333" },
          "fontSize": { "value": 14 },
          "fontWeight": { "value": "bold" },
          "text": { "field": "Name" },
          "align": { "value": "center" },
          "baseline": { "value": "center" }
        },
        "update": {
          "x": {"signal": "scale('x', cursorX) + 40"},
          "y": {"signal": "scale('y', cursorY) + datum.index * 10", "offset": -2}
        }
      }
    },
  ],
};
vega(document.getElementById("LibraPlayground"), spec);
