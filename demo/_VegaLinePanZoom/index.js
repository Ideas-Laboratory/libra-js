const loadName = 'testLine.json';

var spec = {
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "description": "An interactive scatter plot example supporting pan and zoom.",
  "width": 500,
  "height": 300,
  "padding": {
    "top": 10,
    "left": 40,
    "bottom": 20,
    "right": 10
  },
  "autosize": "none",

  "config": {
    "axis": {
      "domain": false,
      "tickSize": 3,
      "tickColor": "#888",
      "labelFont": "Monaco, Courier New"
    }
  },

  "signals": [
    {
      "name": "margin",
      "value": 20
    },
    {
      "name": "hover",
      "on": [
        { "events": "*:pointerover", "encode": "hover" },
        { "events": "*:pointerout", "encode": "leave" },
        { "events": "*:pointerdown", "encode": "select" },
        { "events": "*:pointerup", "encode": "release" }
      ]
    },
    {
      "name": "xoffset",
      "update": "-(height + padding.bottom)"
    },
    {
      "name": "yoffset",
      "update": "-(width + padding.left)"
    },
    { "name": "xrange", "update": "[0, width]" },
    { "name": "yrange", "update": "[height, 0]" },

    {
      "name": "down", "value": null,
      "on": [
        { "events": "touchend", "update": "null" },
        { "events": "pointerdown, touchstart", "update": "xy()" }
      ]
    },
    {
      "name": "xcur", "value": null,
      "on": [
        {
          "events": "pointerdown, touchstart, touchend",
          "update": "slice(xdom)"
        }
      ]
    },
    {
      "name": "ycur", "value": null,
      "on": [
        {
          "events": "pointerdown, touchstart, touchend",
          "update": "slice(ydom)"
        }
      ]
    },
    {
      "name": "delta", "value": [0, 0],
      "on": [
        {
          "events": [
            {
              "source": "window", "type": "pointermove", "consume": true,
              "between": [{ "type": "pointerdown" }, { "source": "window", "type": "pointerup" }]
            },
            {
              "type": "touchmove", "consume": true,
              "filter": "event.touches.length === 1"
            }
          ],
          "update": "down ? [down[0]-x(), 0] : [0,0]"
        }
      ]
    },

    {
      "name": "anchor", "value": [0, 0],
      "on": [
        {
          "events": "wheel",
          "update": "[invert('xscale', x()), 0]"
        }
      ]
    },
    {
      "name": "zoom", "value": 1,
      "on": [
        {
          "events": "wheel!",
          "force": true,
          "update": "pow(1.001, event.deltaY * pow(16, event.deltaMode))"
        }
      ]
    },


    {
      "name": "xdom", "update": "slice(xext)",
      "on": [
        {
          "events": { "signal": "delta" },
          "update": "[xcur[0] + span(xcur) * delta[0] / width, xcur[1] + span(xcur) * delta[0] / width]"
        },
        {
          "events": { "signal": "zoom" },
          "update": "[anchor[0] + (xdom[0] - anchor[0]) * zoom, anchor[0] + (xdom[1] - anchor[0]) * zoom]"
        }
      ]
    },
    {
      "name": "ydom", "update": "slice(yext)",
      "on": [
        {
          "events": { "signal": "delta" },
          "update": "[ycur[0] + span(ycur) * delta[1] / height, ycur[1] + span(ycur) * delta[1] / height]"
        },
        {
          "events": { "signal": "zoom" },
          "update": "[anchor[1] + (ydom[0] - anchor[1]) * zoom, anchor[1] + (ydom[1] - anchor[1]) * zoom]"
        }
      ]
    },
    {
      "name": "size",
      "update": "clamp(2000 / span(xdom), 1, 100)"
    }
  ],

  "data": [
    {
      "name": "points",
      "url": "data/testLine.json",
      "transform": [
        // { "type": "extent", "field": "x", "signal": "xext" },
        // { "type": "extent", "field": "y", "signal": "yext" }
      ]
    },
    {
      "name": "points2",
      "url": "data/testLine2.json",
      "transform": [
        { "type": "extent", "field": "x", "signal": "xext" },
        { "type": "extent", "field": "y", "signal": "yext" }
      ]
    }
  ],

  "scales": [
    {
      "name": "xscale", "zero": false,
      "domain": { "signal": "xdom" },
      "range": { "signal": "xrange" }
    },
    {
      "name": "yscale", "zero": false,
      "domain": { "signal": "ydom" },
      "range": { "signal": "yrange" }
    }
  ],

  "axes": [
    {
      "scale": "xscale",
      "orient": "top",
      "offset": { "signal": "xoffset" }
    },
    {
      "scale": "yscale",
      "orient": "right",
      "offset": { "signal": "yoffset" }
    }
  ],

  "marks": [
    {
      "type": "line",
      "from": { "data": "points" },
      "clip": true,
      "encode": {
        "enter": {
          "fillOpacity": { "value": 0.6 },
          "stroke": { "value": "steelblue" },
        },
        "update": {
          "x": { "scale": "xscale", "field": "x" },
          "y": { "scale": "yscale", "field": "y" },
          "y2": {"scale": "yscale", "value": 0},"width": {"value": 5},
        },
        "hover": { "stroke": { "value": "firebrick" } },
        "leave": { "stroke": { "value": "steelblue" } },
        "select": { "size": { "signal": "size", "mult": 5 } },
        "release": { "size": { "signal": "size" } }
      }
    },
    {
      "type": "line",
      "from": { "data": "points2" },
      "clip": true,
      "encode": {
        "enter": {
          "fillOpacity": { "value": 0.6 },
          "stroke": { "value": "steelblue" },
        },
        "update": {
          "x": { "scale": "xscale", "field": "x" },
          "y": { "scale": "yscale", "field": "y" },
          "y2": {"scale": "yscale", "value": 0},"width": {"value": 5},
        },
        "hover": { "stroke": { "value": "firebrick" } },
        "leave": { "stroke": { "value": "steelblue" } },
        "select": { "size": { "signal": "size", "mult": 5 } },
        "release": { "size": { "signal": "size" } }
      }
    }
  ]
}
vega(document.getElementById("LibraPlayground"), spec);
