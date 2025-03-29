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
      "name": "cursor",
      "value": '',
      "on": [
        {"events": "mousedown", "update": "datum.id"},
        {"events": "mouseup", "update": "''"}
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
          "type": "window",
          "ops": ["row_number"],
          "as": ["id"]
        },
        {
          "type": "formula",
          "expr": "datum.id == cursor",
          "as": "marked"
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
              "test": "datum.marked === true", // 检查 marked 是否为 true
              "value": "red" // 如果为 true，则使用红色
            },
            {"value": "black"} 
          ],
          "zindex": {"value": 0}
        }
      },
      "transform": [
        { "type": "geoshape", "projection": "projection" }
      ]
    }
  ]
}
vega(document.getElementById("LibraPlayground"), spec);
