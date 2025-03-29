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
      "url": "data/testLine2.json",
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
      "type": "line", // 将标记类型改为rect以绘制柱状
      "from": {"data": "source"},
      "encode": {
        "update": {
          "x": {"scale": "x", "field": "x"},
          "y": {"scale": "y", "field": "y"},
          "stroke": {"value": "steelblue"}
        },
        "hover": {
          "stroke": {"value": "firebrick"},
          "zindex": {"value": 1}
        }
      }
    },
    {
      "type": "line", // 将标记类型改为rect以绘制柱状
      "from": {"data": "source2"},
      "encode": {
        "update": {
          "x": {"scale": "x", "field": "x"},
          "y": {"scale": "y", "field": "y"},
          "stroke": {"value": "steelblue"}
        },
        "hover": {
          "stroke": {"value": "firebrick"},
          "zindex": {"value": 1}
        }
      }
    }
  ]
};
vega(document.getElementById("LibraPlayground"), spec);
