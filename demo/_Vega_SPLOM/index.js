const loadName = 'penguins.csv';

const spec = {
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "description": "A scatter plot matrix of penguin data with interactive linked selections.",
  "padding": 10,
  "config": { "axis": { "tickColor": "#ccc" } },
  "signals": [
    { "name": "chartSize", "value": 197 },
    { "name": "chartPad", "value": 28 },
    { "name": "chartStep", "update": "chartSize + chartPad" },
    { "name": "width", "update": "chartStep * 4" },
    { "name": "height", "update": "chartStep * 4" },
    {
      "name": "cell",
      "value": null,
      "on": [
        { "events": "@cell:mousedown", "update": "group()" },
        {
          "events": "@cell:mouseup",
          "update": "!span(brushX) && !span(brushY) ? null : cell"
        }
      ]
    },
    {
      "name": "brushX",
      "value": 0,
      "on": [
        { "events": "@cell:mousedown", "update": "[x(cell), x(cell)]" },
        {
          "events": "[@cell:mousedown, window:mouseup] > window:mousemove",
          "update": "[brushX[0], clamp(x(cell), 0, chartSize)]"
        },
        {
          "events": { "signal": "delta" },
          "update": "clampRange([anchorX[0] + delta[0], anchorX[1] + delta[0]], 0, chartSize)"
        }
      ]
    },
    {
      "name": "brushY",
      "value": 0,
      "on": [
        { "events": "@cell:mousedown", "update": "[y(cell), y(cell)]" },
        {
          "events": "[@cell:mousedown, window:mouseup] > window:mousemove",
          "update": "[brushY[0], clamp(y(cell), 0, chartSize)]"
        },
        {
          "events": { "signal": "delta" },
          "update": "clampRange([anchorY[0] + delta[1], anchorY[1] + delta[1]], 0, chartSize)"
        }
      ]
    },
    {
      "name": "down",
      "value": [0, 0],
      "on": [{ "events": "@brush:mousedown", "update": "[x(cell), y(cell)]" }]
    },
    {
      "name": "anchorX",
      "value": null,
      "on": [{ "events": "@brush:mousedown", "update": "slice(brushX)" }]
    },
    {
      "name": "anchorY",
      "value": null,
      "on": [{ "events": "@brush:mousedown", "update": "slice(brushY)" }]
    },
    {
      "name": "delta",
      "value": [0, 0],
      "on": [
        {
          "events": "[@brush:mousedown, window:mouseup] > window:mousemove",
          "update": "[x(cell) - down[0], y(cell) - down[1]]"
        }
      ]
    },
    {
      "name": "rangeX",
      "value": [0, 0],
      "on": [
        {
          "events": { "signal": "brushX" },
          "update": "invert(cell.datum.x.data + 'X', brushX)"
        }
      ]
    },
    {
      "name": "rangeY",
      "value": [0, 0],
      "on": [
        {
          "events": { "signal": "brushY" },
          "update": "invert(cell.datum.y.data + 'Y', brushY)"
        }
      ]
    },
    {
      "name": "cursor",
      "value": "'default'",
      "on": [
        {
          "events": "[@cell:mousedown, window:mouseup] > window:mousemove!",
          "update": "'nwse-resize'"
        },
        {
          "events": "@brush:mousemove, [@brush:mousedown, window:mouseup] > window:mousemove!",
          "update": "'move'"
        },
        { "events": "@brush:mouseout, window:mouseup", "update": "'default'" }
      ]
    }
  ],
  "data": [
    {
      "name": "penguins",
      "url": "data/" + loadName,
      "format": { "type": "csv", "parse": "auto" },
      "transform": [
        { "type": "filter", "expr": "datum['culmen_length_mm'] != 'NaN'" }
      ]
    },
    {
      "name": "fields",
      "values": [
        "culmen_length_mm",
        "culmen_depth_mm",
        "flipper_length_mm",
        "body_mass_g"
      ]
    },
    {
      "name": "cross",
      "source": "fields",
      "transform": [
        { "type": "cross", "as": ["x", "y"] },
        { "type": "formula", "as": "xscale", "expr": "datum.x.data + 'X'" },
        { "type": "formula", "as": "yscale", "expr": "datum.y.data + 'Y'" }
      ]
    }
  ],
  "scales": [
    {
      "name": "groupx",
      "type": "band",
      "range": "width",
      "domain": { "data": "fields", "field": "data" }
    },
    {
      "name": "groupy",
      "type": "band",
      "range": [{ "signal": "height" }, 0],
      "domain": { "data": "fields", "field": "data" }
    },
    {
      "name": "color",
      "type": "ordinal",
      "domain": { "data": "penguins", "field": "species" },
      "range": "category"
    },
    {
      "name": "culmen_length_mmX",
      "zero": false,
      "nice": true,
      "domain": { "data": "penguins", "field": "culmen_length_mm" },
      "range": [0, { "signal": "chartSize" }]
    },
    {
      "name": "culmen_depth_mmX",
      "zero": false,
      "nice": true,
      "domain": { "data": "penguins", "field": "culmen_depth_mm" },
      "range": [0, { "signal": "chartSize" }]
    },
    {
      "name": "flipper_length_mmX",
      "zero": false,
      "nice": true,
      "domain": { "data": "penguins", "field": "flipper_length_mm" },
      "range": [0, { "signal": "chartSize" }]
    },
    {
      "name": "body_mass_gX",
      "zero": false,
      "nice": true,
      "domain": { "data": "penguins", "field": "body_mass_g" },
      "range": [0, { "signal": "chartSize" }]
    },
    {
      "name": "culmen_length_mmY",
      "zero": false,
      "nice": true,
      "domain": { "data": "penguins", "field": "culmen_length_mm" },
      "range": [{ "signal": "chartSize" }, 0]
    },
    {
      "name": "culmen_depth_mmY",
      "zero": false,
      "nice": true,
      "domain": { "data": "penguins", "field": "culmen_depth_mm" },
      "range": [{ "signal": "chartSize" }, 0]
    },
    {
      "name": "flipper_length_mmY",
      "zero": false,
      "nice": true,
      "domain": { "data": "penguins", "field": "flipper_length_mm" },
      "range": [{ "signal": "chartSize" }, 0]
    },
    {
      "name": "body_mass_gY",
      "zero": false,
      "nice": true,
      "domain": { "data": "penguins", "field": "body_mass_g" },
      "range": [{ "signal": "chartSize" }, 0]
    }
  ],
  "axes": [
    {
      "orient": "left",
      "scale": "culmen_length_mmY",
      "minExtent": 25,
      "title": "culmen_length_mm",
      "tickCount": 5,
      "domain": false,
      "position": { "signal": "3 * chartStep" }
    },
    {
      "orient": "left",
      "scale": "culmen_depth_mmY",
      "minExtent": 25,
      "title": "culmen_depth_mm",
      "tickCount": 5,
      "domain": false,
      "position": { "signal": "2 * chartStep" }
    },
    {
      "orient": "left",
      "scale": "flipper_length_mmY",
      "minExtent": 25,
      "title": "flipper_length_mm",
      "tickCount": 5,
      "domain": false,
      "position": { "signal": "1 * chartStep" }
    },
    {
      "orient": "left",
      "scale": "body_mass_gY",
      "minExtent": 25,
      "title": "body_mass_g",
      "tickCount": 5,
      "domain": false
    },
    {
      "orient": "bottom",
      "scale": "culmen_length_mmX",
      "title": "culmen_length_mm",
      "tickCount": 5,
      "domain": false,
      "offset": { "signal": "-chartPad" }
    },
    {
      "orient": "bottom",
      "scale": "culmen_depth_mmX",
      "title": "culmen_depth_mm",
      "tickCount": 5,
      "domain": false,
      "offset": { "signal": "-chartPad" },
      "position": { "signal": "1 * chartStep" }
    },
    {
      "orient": "bottom",
      "scale": "flipper_length_mmX",
      "title": "flipper_length_mm",
      "tickCount": 5,
      "domain": false,
      "offset": { "signal": "-chartPad" },
      "position": { "signal": "2 * chartStep" }
    },
    {
      "orient": "bottom",
      "scale": "body_mass_gX",
      "title": "body_mass_g",
      "tickCount": 5,
      "domain": false,
      "offset": { "signal": "-chartPad" },
      "position": { "signal": "3 * chartStep" }
    }
  ],
  "legends": [
    {
      "fill": "color",
      "title": "species",
      "offset": 0,
      "encode": {
        "symbols": {
          "update": {
            "fillOpacity": { "value": 0.5 },
            "stroke": { "value": "transparent" }
          }
        }
      }
    }
  ],
  "marks": [
    {
      "type": "rect",
      "encode": {
        "enter": { "fill": { "value": "#eee" } },
        "update": {
          "opacity": { "signal": "cell ? 1 : 0" },
          "x": { "signal": "cell ? cell.x + brushX[0] : 0" },
          "x2": { "signal": "cell ? cell.x + brushX[1] : 0" },
          "y": { "signal": "cell ? cell.y + brushY[0] : 0" },
          "y2": { "signal": "cell ? cell.y + brushY[1] : 0" }
        }
      }
    },
    {
      "name": "cell",
      "type": "group",
      "from": { "data": "cross" },
      "encode": {
        "enter": {
          "x": { "scale": "groupx", "field": "x.data" },
          "y": { "scale": "groupy", "field": "y.data" },
          "width": { "signal": "chartSize" },
          "height": { "signal": "chartSize" },
          "fill": { "value": "transparent" },
          "stroke": { "value": "#ddd" }
        }
      },
      "marks": [
        {
          "type": "symbol",
          "from": { "data": "penguins" },
          "interactive": false,
          "encode": {
            "enter": {
              "x": {
                "scale": { "parent": "xscale" },
                "field": { "datum": { "parent": "x.data" } }
              },
              "y": {
                "scale": { "parent": "yscale" },
                "field": { "datum": { "parent": "y.data" } }
              },
              "fillOpacity": { "value": 0.5 },
              "size": { "value": 36 }
            },
            "update": {
              "fill": [
                {
                  "test": "!cell || inrange(datum[cell.datum.x.data], rangeX) && inrange(datum[cell.datum.y.data], rangeY)",
                  "scale": "color",
                  "field": "species"
                },
                { "value": "#ddd" }
              ]
            }
          }
        }
      ]
    },
    {
      "type": "rect",
      "name": "brush",
      "encode": {
        "enter": { "fill": { "value": "transparent" } },
        "update": {
          "x": { "signal": "cell ? cell.x + brushX[0] : 0" },
          "x2": { "signal": "cell ? cell.x + brushX[1] : 0" },
          "y": { "signal": "cell ? cell.y + brushY[0] : 0" },
          "y2": { "signal": "cell ? cell.y + brushY[1] : 0" }
        }
      }
    }
  ]
};
vega(document.getElementById("LibraPlayground"), spec);


