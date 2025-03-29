const loadName = 'test100.json';

var spec = {
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "description": "A basic scatter plot example depicting automobile statistics.", 
  "width": 200,
  "height": 200,
  "padding": 5,
  "signals": [
    {
      "name": "clickedDatum",
      "value": null,
      "desc": "Stores the clicked datum, or null if nothing is clicked."
    }
  ],
  "data": [
    {
      "name": "source",
      "url": "data/"+loadName,
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
      "domain": {"data": "source", "field": "x"},
      "range": "width"
    },
    {
      "name": "y",
      "type": "linear",
      "round": true,
      "nice": true,
      "zero": true,
      "domain": {"data": "source", "field": "y"},
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
      "from": {"data": "source"},
      "encode": {
        "enter": {
          "shape": {"value": "circle"},
          "strokeWidth": {"value": 2},
          "stroke": {"value": "#4682b4"}
        },
        "update": {
          "x": {"scale": "x", "field": "x"},
          "y": {"scale": "y", "field": "y"},
          "fill": [
            {
              "test": "clickedDatum && clickedDatum.datum === datum",
              "value": "firebrick"
            },
            {"value": "transparent"}
          ],
          "fillOpacity": [
            {
              "test": "clickedDatum && clickedDatum.datum === datum",
              "value": 1
            },
            {"value": 0.5}
          ]
        },
        "hover": {
          "cursor": {"value": "pointer"}
        }
      }
    }
  ],
  "handlers": [
    {
      "events": {"click": {"consume": true}},
      "update": "clickedDatum = invert('marks', datum)"
    }
  ]
};

vega(document.getElementById("LibraPlayground"), spec);
