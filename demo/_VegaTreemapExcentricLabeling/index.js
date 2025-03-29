
var spec = {
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "description": "An example of treemap layout for hierarchical data.",
  "width": 960,
  "height": 500,
  "padding": 2.5,
  "autosize": "none",

  "signals": [
    {
      "name": "layout", "value": "squarify"
    },
    {
      "name": "aspectRatio", "value": 1.6
    },
    {
      "name": "cursorY",
      "update": "0",
      "on": [
        {
          "events": "pointermove",
          "update": "clamp(y(), 0, height)"
        }
      ]
    },
    {
      "name": "cursorX",
      "update": "0",
      "on": [
        {
          "events": "pointermove",
          "update": "clamp(x(), 0, width)"
        }
      ]
    }
  ],

  "data": [
    {
      "name": "tree",
      "url": "data/flare.json",
      "transform": [
        {
          "type": "stratify",
          "key": "id",
          "parentKey": "parent"
        },
        {
          "type": "treemap",
          "field": "size",
          "sort": { "field": "value" },
          "round": true,
          "method": { "signal": "layout" },
          "ratio": { "signal": "aspectRatio" },
          "size": [{ "signal": "width" }, { "signal": "height" }]
        }
      ]
    },
    {
      "name": "nodes",
      "source": "tree",
      "transform": [{ "type": "filter", "expr": "datum.children" }]
    },
    {
      "name": "leaves",
      "source": "tree",
      "transform": [{ "type": "filter", "expr": "!datum.children" }]
    },
    {
      "name": "selected",
      "source": "leaves",
      "transform": [
        {
          "type": "filter",
          "expr": "(datum.x0<=(cursorX+10) && datum.x1>=(cursorX-10)) && (datum.y0<=(cursorY+10) && datum.y1>=(cursorY-10))"
        },
        {
          "type": "window",
          "ops": ["row_number"],
          "as": ["index"]
        }
      ]
    }
  ],

  "scales": [
    {
      "name": "color",
      "type": "ordinal",
      "domain": { "data": "nodes", "field": "name" },
      "range": [
        "#3182bd", "#6baed6", "#9ecae1", "#c6dbef", "#e6550d",
        "#fd8d3c", "#fdae6b", "#fdd0a2", "#31a354", "#74c476",
        "#a1d99b", "#c7e9c0", "#756bb1", "#9e9ac8", "#bcbddc",
        "#dadaeb", "#636363", "#969696", "#bdbdbd", "#d9d9d9"
      ]
    },
    {
      "name": "size",
      "type": "ordinal",
      "domain": [0, 1, 2, 3],
      "range": [256, 28, 20, 14]
    },
    {
      "name": "opacity",
      "type": "ordinal",
      "domain": [0, 1, 2, 3],
      "range": [0.15, 0.5, 0.8, 1.0]
    }
  ],

  "marks": [
    {
      "type": "rect",
      "from": { "data": "nodes" },
      "interactive": false,
      "encode": {
        "enter": {
          "fill": { "scale": "color", "field": "name" }
        },
        "update": {
          "x": { "field": "x0" },
          "y": { "field": "y0" },
          "x2": { "field": "x1" },
          "y2": { "field": "y1" }
        }
      }
    },
    {
      "type": "rect",
      "from": { "data": "leaves" },
      "encode": {
        "enter": {
          "stroke": { "value": "#fff" }
        },
        "update": {
          "x": { "field": "x0" },
          "y": { "field": "y0" },
          "x2": { "field": "x1" },
          "y2": { "field": "y1" },
          "fill": { "value": "transparent" }
        },
        // "hover": {
        //   "fill": {"value": "red"}
        // }
      }
    },
    {
      "type": "rect",
      "from": { "data": "selected" },
      "encode": {
        "enter": {
          "stroke": { "value": "firebrick" },
          "strokeWidth": { "value": "2" },
          "strokeOpacity": { "value": "0.5" }
        },
        "update": {
          "x": { "field": "x0" },
          "y": { "field": "y0" },
          "x2": { "field": "x1" },
          "y2": { "field": "y1" },
          "fill": { "value": "transparent" }
        },
        // "hover": {
        //   "fill": {"value": "red"}
        // }
      }
    },
    {
      "type": "rule",
      "from": { "data": "selected" },
      "encode": {
        "enter": {
          // "x": {"field": "x0"},
          // "y": {"field": "y0"},
          // "x2": {"field": "x1"},
          // "y2": {"field": "y1"},
        },
        "update": {
          "x": { "signal": "(datum.x0 + datum.x1) * 0.5" },
          "y": { "signal": "(datum.y0 + datum.y1) * 0.5" },
          "x2": { "signal": "cursorX + 30" },
          "y2": { "signal": "cursorY + datum.index * 15" },
          "stroke": { "value": "firebrick" }
        },
        // "hover": {
        //   "fill": {"value": "red"}
        // }
      }
    },
    {
      "type": "text",
      "from": { "data": "nodes" },
      "interactive": false,
      "encode": {
        "enter": {
          "font": { "value": "Helvetica Neue, Arial" },
          "align": { "value": "center" },
          "baseline": { "value": "middle" },
          "fill": { "value": "#000" },
          "text": { "field": "name" },
          "fontSize": { "scale": "size", "field": "depth" },
          "fillOpacity": { "scale": "opacity", "field": "depth" }
        },
        "update": {
          "x": { "signal": "0.5 * (datum.x0 + datum.x1)" },
          "y": { "signal": "0.5 * (datum.y0 + datum.y1)" }
        }
      }
    },
    {
      "type": "text",
      "from": { "data": "selected" },
      "interactive": false,
      "encode": {
        "enter": {
          "font": { "value": "Helvetica Neue, Arial" },
          "align": { "value": "center" },
          "baseline": { "value": "middle" },
          "fill": { "value": "firebrick" },
          "text": { "field": "name" },
        },
        "update": {
          "x": { "signal": "cursorX + 30" },
          "y": { "signal": "cursorY + datum.index * 15" },
        }
      }
    },
    {
      type: "symbol",
      encode: {
        update: {
          x: { "signal": "cursorX" },
          y: { "signal": "cursorY" },
          size: { "value": 2000 },
          shape: { value: "circle" },
          strokeWidth: { value: 2 },
          stroke: { value: "firebrick" },
          fill: { value: "transparent" },
        },
      },
    }
  ]
}
vega(document.getElementById("LibraPlayground"), spec);
