const loadName = 'testBar.json';
var spec = {
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "description": "A basic bar chart with brushing",
  "width": 200,
  "height": 200,
  "padding": 5,
  "data": [
    {
      "name": "source",
      "url": "data/testLine.json",
      "transform": [
        {
          "type": "filter",
          "expr": "datum['x'] != null && datum['y'] != null"
        }
      ]
    },
    {
      "name": "source2",
      "url": "data/testLine.json",
      "transform": [
        {
          "type": "filter",
          "expr": "datum['x'] != null && datum['y'] != null"
        },
        {
          "type": "formula",
          "expr": "inrange(scale('x', datum.x), [brush.x, brush.x2]) && inrange(scale('y', datum.y), [brush.y, brush.y2]) ? 1 : 0",
          "as": "marked"
        },
        {
          "type": "window",
          "ops": ["sum"],
          "fields": ["marked"],
          "as": ["lineMarked"],
          "frame": [null, null]
        }
      ]
    },
    {
      "name": "source3",
      "url": "data/testLine2.json",
      "transform": [
        {
          "type": "filter",
          "expr": "datum['x'] != null && datum['y'] != null"
        },
        {
          "type": "formula",
          "expr": "inrange(scale('x', datum.x), [brush.x, brush.x2]) && inrange(scale('y', datum.y), [brush.y, brush.y2]) ? 1 : 0",
          "as": "marked"
        },
        {
          "type": "window",
          "ops": ["sum"],
          "fields": ["marked"],
          "as": ["lineMarked"],
          "frame": [null, null]
        }
      ]
    }
  ],
  "scales": [
    {
      "name": "x",
      "type": "band", // 将x轴类型改为band以绘制柱状图
      "domain": {"data": "source", "field": "x"},
      "range": "width",
      "padding": 0.1
    },
    {
      "name": "y",
      "type": "linear",
      "nice": true,
      "zero": true,
      "domain": {"data": "source", "field": "y"},
      "range": "height"
    }
  ],
  "axes": [
    {"scale": "x", "orient": "bottom", "title": "x"},
    {"scale": "y", "orient": "left", "titlePadding": 5, "title": "y"}
  ],
  "marks": [
    {
      "type": "line", // 将标记类型改为rect以绘制柱状
      "from": {"data": "source2"},
      "encode": {
        "enter": {
          "x": {"scale": "x", "field": "x"},
          "y": {"scale": "y", "field": "y"},
        },
        "update": {
          "stroke": [
            {
              "test": "datum.lineMarked > 0",
              "value": "red"
            },
            {"value": "steelblue"}
          ]
        }
      }
    },
    {
      "type": "line", // 将标记类型改为rect以绘制柱状
      "from": {"data": "source3"},
      "encode": {
        "enter": {
          "x": {"scale": "x", "field": "x"},
          "y": {"scale": "y", "field": "y"},
        },
        "update": {
          "stroke": [
            {
              "test": "datum.lineMarked > 0",
              "value": "red"
            },
            {"value": "steelblue"}
          ]
        }
      }
    },
    // {
    //   "type": "text",
    //   "from": { "data": "source2" },
    //   "interactive": false,
    //   "encode": {
    //     "enter": {
    //       "font": { "value": "Helvetica Neue, Arial" },
    //       "align": { "value": "center" },
    //       "baseline": { "value": "middle" },
    //       "fill": { "value": "#000" },
    //     },
    //     "update": {
    //       "x": {"scale": "x", "field": "x"},
    //       "y": {"scale": "y", "field": "y"},
    //       "text": { "field": "lineMarked" },
    //     }
    //   }
    // },
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
  ],
  "signals": [
    {
      "name": "brush",
      "value": {},
      "on": [
        { "events": { "type": "mousedown" }, "update": "{x: x(event.clientX), y: y(event.clientY), x2: x(event.clientX), y2: y(event.clientY), down: true}" },
        { "events": { "type": "mousemove" }, "update": "brush.down ? {x: brush.x, y: brush.y, x2: x(event.clientX), y2: y(event.clientY), down:true} : brush" },
        { "events": { "type": "mouseup" }, "update": "brush.down ? {x: brush.x, y: brush.y, x2: x(event.clientX), y2: y(event.clientY), down: false} : brush" }
      ]
    }
  ]
};
vega(document.getElementById("LibraPlayground"), spec);
