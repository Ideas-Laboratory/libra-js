const loadName = 'test100.json';

var spec = {
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "description": "A configurable map of countries of the world.",
  "width": 900,
  "height": 500,
  "autosize": "none",

  "signals": [
    {
      "name": "type",
      "value": "mercator"
    },
    { "name": "scale", "value": 150},
    { "name": "rotate0", "value": 0},
    { "name": "rotate1", "value": 0},
    { "name": "rotate2", "value": 0},
    { "name": "center0", "value": 0},
    { "name": "center1", "value": 0},
    { "name": "translate0", "update": "width / 2" },
    { "name": "translate1", "update": "height / 2" },

    { "name": "graticuleDash", "value": 0},
    { "name": "borderWidth", "value": 1},
    { "name": "background", "value": "#ffffff"},
    { "name": "invert", "value": false},
    {
      "name": "brush",
      "value": {},
      "on": [
        { "events": { "type": "mousedown" }, "update": "{x: x(event.clientX), y: y(event.clientY), x2: x(event.clientX), y2: y(event.clientY), down: true}" },
        { "events": { "type": "mousemove" }, "update": "brush.down ? {x: brush.x, y: brush.y, x2: x(event.clientX), y2: y(event.clientY), down:true} : brush" },
        { "events": { "type": "mouseup" }, "update": "brush.down ? {x: brush.x, y: brush.y, x2: x(event.clientX), y2: y(event.clientY), down: false} : brush" }
      ]
    }
  ],

  "projections": [
    {
      "name": "projection",
      "type": {"signal": "type"},
      "scale": {"signal": "scale"},
      "rotate": [
        {"signal": "rotate0"},
        {"signal": "rotate1"},
        {"signal": "rotate2"}
      ],
      "center": [
        {"signal": "center0"},
        {"signal": "center1"}
      ],
      "translate": [
        {"signal": "translate0"},
        {"signal": "translate1"}
      ]
    }
  ],

  "data": [
    {
      "name": "world",
      "url": "data/world-110m.json",
      "format": {
        "type": "topojson",
        "feature": "countries"
      },
      "transform": [
        {
          "type": "geoshape",
          "projection": "projection",
        },
        {
          "type": "extent",
          "field": "path",
          "signal": "bounds"
        }
      ]
    },
    {
      "name": "graticule",
      "transform": [
        { "type": "graticule" }
      ]
    }
  ],

  "marks": [
    {
      "type": "shape",
      "from": {"data": "graticule"},
      "encode": {
        "update": {
          "strokeWidth": {"value": 1},
          "strokeDash": {"signal": "[+graticuleDash, +graticuleDash]"},
          "stroke": {"signal": "invert ? '#444' : '#ddd'"},
          "fill": {"value": null}
        }
      },
      "transform": [
        { "type": "geoshape", "projection": "projection" }
      ]
    },
    {
      "type": "shape",
      "from": {"data": "world"},
      "encode": {
        "update": {
          "strokeWidth": {"signal": "+borderWidth"},
          "stroke": {"signal": "invert ? '#777' : '#bbb'"},
          "fill": [
            {
              "test": "inrange(datum.shape[0], [brush.x, brush.x2]) && inrange(datum.shape[0], [brush.y, brush.y2])",
              "value": "red"
            },
            {"value": "#000"}
          ],
          "zindex": {"value": 0}
        }
      },
      "transform": [
        { "type": "geoshape", "projection": "projection" }
      ]
    },
    {
      "type": "text",
      "from": {"data": "world"},
      "encode": {
        "update": {
          "x": { "signal": "datum.shape[0][0]" },
          "y": { "signal": "datum.shape[0][1]" },
          "text": { "value": "name" },
          "fill": [
            {"value": "#000"}
          ],
          "zindex": {"value": 1}
        }
      },
      "transform": [
        { "type": "geoshape", "projection": "projection" }
      ]
    },
    {
      "type": "rect",
      "name": "brush",
      "encode": {
        "enter": {
          "fill": {"value": "#333"},
          "fillOpacity": {"value": 0.2}
        },
        "update": {
          "x": {"signal": "brush.x"},
          "y": {"signal": "brush.y"},
          "x2": {"signal": "brush.x2"},
          "y2": {"signal": "brush.y2"}
        }
      }
    }
  ]
}
vega(document.getElementById("LibraPlayground"), spec);
