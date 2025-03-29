const loadName = 'testBar.json';
var spec = {
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "description": "A basic bar chart with brushing",
  "width": 200,
  "height": 200,
  "padding": 5,
  "signals": [
    {
      "name": "cursor",
      "value": '',
      "on": [
        {"events": "mousedown", "update": "datum.id"},
        {"events": "mouseup", "update": "''"}
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
        },
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
      "name": "marks",
      "type": "rect", // 将标记类型改为rect以绘制柱状
      "from": {"data": "source"},
      "encode": {
        "update": {
          "x": {"scale": "x", "field": "x"},
          "width": {"scale": "x", "band": 1, "offset": -1},
          "y": {"scale": "y", "field": "y"},
          "y2": {"scale": "y", "value": 0},
          "fill": [
            {
              "test": "datum.marked === true", // 检查 marked 是否为 true
              "value": "red" // 如果为 true，则使用红色
            },
            {"value": "steelblue"} // 否则使用 steelblue
          ]
        }
      }
    }
  ]
};
vega(document.getElementById("LibraPlayground"), spec);
