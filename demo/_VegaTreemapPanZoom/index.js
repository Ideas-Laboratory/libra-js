var spec = {
  "$schema": "https://vega.github.io/schema/vega/v5.json", "description": "An example of treemap layout for hierarchical data with pan and zoom interaction.", "width": 960, "height": 500, "padding": 2.5, "autosize": "none",
  "signals": [
    {
      // "name": "tx", "update": "width / 2"
      "name": "tx", "update": "0"
    },
    {
      // "name": "ty", "update": "height / 2"
      "name": "ty", "update": "0"
    },
    {
      "name": "zoom", "value": 1,
      "on": [
        {
          "events": "wheel!",
          "update": "clamp(zoom * pow(1.001, -event.deltaY), 0.1, 10)"
        }
      ]
    },
    {
      "name": "down", "value": null,
      "on": [{ "events": "touchend", "update": "null" },
      { "events": "pointerdown, touchstart", "update": "xy()" }]
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
          "update": "down ? [x() - down[0], y() - down[1]] : [0, 0]"
        }
      ]
    },
    {
      "name": "xoffset", "value": 0,
      "on": [{ "events": { "signal": "delta" }, "update": "delta[0]" }]
    },
    {
      "name": "yoffset", "value": 0,
      "on": [{ "events": { "signal": "delta" }, "update": "delta[1]" }]
    },
    {
      "name": "layout", "value": "squarify"
    },
    {
      "name": "aspectRatio", "value": 1.6
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
          "x": { "signal": "((datum.x0 + xoffset) * zoom) + tx" },
          "y": { "signal": "((datum.y0 + yoffset) * zoom) + ty" },
          "x2": { "signal": "((datum.x1 + xoffset) * zoom) + tx" },
          "y2": { "signal": "((datum.y1 + yoffset) * zoom) + ty" }
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
          "x": { "signal": "((datum.x0 + xoffset) * zoom) + tx" },
          "y": { "signal": "((datum.y0 + yoffset) * zoom) + ty" },
          "x2": { "signal": "((datum.x1 + xoffset) * zoom) + tx" },
          "y2": { "signal": "((datum.y1 + yoffset) * zoom) + ty" },
          "fill": { "value": "transparent" }
        },
        "hover": {
          "fill": { "value": "red" }
        }
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
          "x": { "signal": "(((datum.x0 + datum.x1) / 2 + xoffset) * zoom) + tx" },
          "y": { "signal": "(((datum.y0 + datum.y1) / 2 + yoffset) * zoom) + ty" }
        }
      }
    }
  ]
}

vega(document.getElementById("LibraPlayground"), spec);
