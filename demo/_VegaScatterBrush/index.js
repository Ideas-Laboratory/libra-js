const loadName = 'test100.json';

var spec = {
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "description": "A basic scatter plot example depicting automobile statistics.",
  "width": 200,
  "height": 200,
  "padding": 5,

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
      "type": "linear",
      "round": true,
      "nice": true,
      "zero": true,
      "domain": { "data": "source", "field": "x" },
      "range": "width"
    },
    {
      "name": "y",
      "type": "linear",
      "round": true,
      "nice": true,
      "zero": true,
      "domain": { "data": "source", "field": "y" },
      "range": "height"
    }
  ],

  "axes": [
    {
      "scale": "x",
      "grid": true,
      "domain": false,
      "orient": "bottom",
      "tickCount": 5,
      "title": "x"
    },
    {
      "scale": "y",
      "grid": true,
      "domain": false,
      "orient": "left",
      "titlePadding": 5,
      "title": "y"
    }
  ],



  "marks": [
    {
      "name": "marks",
      "type": "symbol",
      "from": { "data": "source" },
      "encode": {
        "enter": {
          "shape": { "value": "circle" },
          "strokeWidth": { "value": 2 },
          "opacity": { "value": 0.5 },
          "stroke":
            { "value": "#4682b4" },
          "x": { "scale": "x", "field": "x" },
          "y": { "scale": "y", "field": "y" }
        },
        "update": {
          "fill": [
            {
              "test": "inrange(scale('x', datum.x), [brush.x, brush.x2]) && inrange(scale('y', datum.y), [brush.y, brush.y2])",
              "value": "red",
            },
            {
              "value": "transparent"
            }
          ],
        }
      }
    },
    {
      "type": "rect",
      "name": "brush",
      "encode": {
        "enter": {
          "fill": { "value": "#333" },
          "fillOpacity": { "value": 0.2 }
        },
        "update": {
          "x": { "signal": "brush.x" },
          "y": { "signal": "brush.y" },
          "x2": { "signal": "brush.x2" },
          "y2": { "signal": "brush.y2" }
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
