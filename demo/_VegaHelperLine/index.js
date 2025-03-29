const loadName = 'testBar.json';
var spec = {
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "description": "A basic bar chart with brushing",
  "width": 200,
  "height": 200,
  "padding": 5,
  "signals": [
    {
      "name": "indexDate",
      "update": "0",
      "on": [
        {
          "events": "pointermove",
          "update": "invert('y', clamp(y(), 0, height))"
        }
      ]
    }
  ],
  "data": [
    {
      "name": "source",
      "url": "data/" + loadName,
      "transform": [
        {
          "type": "filter",
          "expr": "datum['x'] != null && datum['y'] != null"
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
      "type": "rect", // 将标记类型改为rect以绘制柱状
      "from": {"data": "source"},
      "encode": {
        "update": {
          "x": {"scale": "x", "field": "x"},
          "width": {"scale": "x", "band": 1, "offset": -1},
          "y": {"scale": "y", "field": "y"},
          "y2": {"scale": "y", "value": 0},
          "fill": {"value": "steelblue"}
        },
        "hover": {
          "fill": {"value": "firebrick"},
          "fillOpacity": {"value": 1},
          "zindex": {"value": 1}
        }
      }
    },
    {
      "type": "rule",
      "encode": {
        "update": {
          "x": {"value": 0},
          "y": {"scale": "y", "signal": "indexDate", "offset": 0.5},
          "x2": {"field": {"group": "width"}},
          "stroke": {"value": "firebrick"}
        }
      }
    },
    {
      "type": "text",
      "encode": {
        "update": {
          "y": {"scale": "y", "signal": "indexDate"},
          "x2": {"field": {"group": "height"}, "offset": 15},
          "align": {"value": "center"},
          "text": {"signal": "indexDate"},
          "fill": {"value": "firebrick"}
        }
      }
    }
  ]
};
vega(document.getElementById("LibraPlayground"), spec);
