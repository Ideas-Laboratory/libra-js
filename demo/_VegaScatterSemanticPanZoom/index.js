const loadName = 'test100.json';

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
          "update": "down ? [down[0]-x(), y()-down[1]] : [0,0]"
        }
      ]
    },

    {
      "name": "anchor", "value": [0, 0],
      "on": [
        {
          "events": "wheel",
          "update": "[invert('xscale', x()), invert('yscale', y())]"
        },
        {
          "events": { "type": "touchstart", "filter": "event.touches.length===2" },
          "update": "[(xdom[0] + xdom[1]) / 2, (ydom[0] + ydom[1]) / 2]"
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
        },
        {
          "events": { "signal": "dist2" },
          "force": true,
          "update": "dist1 / dist2"
        },

      ]
    },
    {
      "name": "zoomAccumulate",
      "value": 1,
      "update": "zoomAccumulate * zoom"
    },
    {
      "name": "dist1", "value": 0,
      "on": [
        {
          "events": { "type": "touchstart", "filter": "event.touches.length===2" },
          "update": "pinchDistance(event)"
        },
        {
          "events": { "signal": "dist2" },
          "update": "dist2"
        }
      ]
    },
    {
      "name": "dist2", "value": 0,
      "on": [{
        "events": { "type": "touchmove", "consume": true, "filter": "event.touches.length===2" },
        "update": "pinchDistance(event)"
      }]
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
      "url": "data/" + loadName,
      "transform": [
        { "type": "extent", "field": "x", "signal": "xext" },
        { "type": "extent", "field": "y", "signal": "yext" }
      ]
    },
    {
      "name": "points_bin10",
      "url": "data/" + loadName,
      "transform": [
        {
          "type": "bin",
          "field": "x", // 按x字段分组
          "extent": { "signal": "xext" }, // 使用extent信号指定x的范围
          "maxbins": { "signal": "floor(20/zoomAccumulate)" }, // 分成10组
          "as": [
            "bin_x", // 存储分组值
            "x_start", "x_end" // 存储组内x的范围
          ]
        },
        {
          "type": "bin",
          "field": "y", // 按x字段分组
          "extent": { "signal": "yext" }, // 使用extent信号指定x的范围
          "maxbins": { "signal": "floor(20/zoomAccumulate)" }, // 分成10组
          "as": [
            "bin_y", // 存储分组值
            "y_start", "y_end" // 存储组内x的范围
          ]
        },
        {
          "type": "aggregate",
          "groupby": ["bin_x","bin_y"], // 按组值分组
          "ops": ["mean","mean", "count"], // 计算均值和计数
          "fields": ["x", "y", null], // 对x/y计算均值,最后一个null用于count操作
          "as": ["x", "y", "count"] // 存储计算结果
        }
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
      "type": "symbol",
      "from": { "data": "points_bin10" },
      "clip": true,
      "encode": {
        "enter": {
          "fillOpacity": { "value": 0.3 },
          "fill": { "value": "steelblue" },
          "stroke": { "value": "steelblue" },
          "strokeWidth": { "value": "2" },
        },
        "update": {
          "x": { "scale": "xscale", "field": "x" },
          "y": { "scale": "yscale", "field": "y" },
          "size": { "signal": "clamp(pow(datum.count, 2)*100, 100, 100000)" }
        },
        "hover": { "fill": { "value": "firebrick" } },
        "leave": { "fill": { "value": "steelblue" } },
        "select": { "size": { "signal": "size", "mult": 5 } },
        "release": { "size": { "signal": "size" } }
      }
    },
    {
      "type": "text",
      "from": { "data": "points_bin10" },
      "interactive": false,
      "encode": {
        "enter": {
          "font": { "value": "Helvetica Neue, Arial" },
          "align": { "value": "center" },
          "baseline": { "value": "middle" },
          "fill": { "value": "#000" },
        },
        "update": {
          "x": { "scale": "xscale", "field": "x" },
          "y": { "scale": "yscale", "field": "y" },
          "text": { "signal": "datum.count > 1 ? datum.count : '' " },
          // "text": { "signal": "1/zoomAccumulate" },
        }
      }
    },
  ]
  
}
vega(document.getElementById("LibraPlayground"), spec);
