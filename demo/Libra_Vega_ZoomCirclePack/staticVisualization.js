  // global variables
globalThis.vegaSpec = {};

async function loadData() {
  globalThis.vegaSpec = {
    "$schema": "https://vega.github.io/schema/vega/v5.json",
    "description": "An example of a zoomable circle packing layout for hierarchical data.",
    "width": 600,
    "height": 600,
    "padding": 0,
    "signals": [
      {
        "name": "duration",
        "init": "750",
        "description": "The duration for the zoom transitions. Fade-in transitions will be the same duration, but will be delayed per the amount set here.",
        "on": [
          {
            "events": {"type": "click", "marknames": ["circles", "background"]},
            "update": "(event.metaKey || event.ctrlKey ? 4 : 1) *750"
          }
        ]
      },
      {
        "name": "k",
        "value": 1,
        "description": "The scale used for zooming based on the focused node",
        "on": [
          {
            "events": [{"signal": "focus"}],
            "update": "focus ? width/(focus.r*2) : 1"
          }
        ]
      },
      {
        "name": "root",
        "update": "{'id': data('tree')[0]['id'], 'x': data('tree')[0]['x'], 'y': data('tree')[0]['y'], 'r': data('tree')[0]['r'], 'k': 1, 'children': data('tree')[0]['children']}",
        "description": "The root node in the hierarchy"
      },
      {
        "name": "focus",
        "init": "root",
        "description": "The zoomed-in node in the hierarchy"
      },
      {
        "name": "focus0",
        "update": "data('focus0') && length(data('focus0'))>0 ? data('focus0')[0] : focus",
        "description": "The prior zoomed-in node in the hierarchy"
      },
      {
        "name": "timer",
        "description": "The timer to be used for transitions such as zoom, fade, etc.",
        "on": [{"events": "timer", "update": "now()"}]
      },
      {
        "name": "interpolateTime",
        "description": "the start and end times in miliseconds for animation interpolations",
        "on": [
          {
            "events": {
              "type": "click",
              "marknames": ["circles", "background"]
            },
            "update": "{'start': timer, 'end': timer+duration}"
          }
        ]
      },
      {
        "name": "t",
        "description": "The normalized time for easing",
        "update": "interpolateTime ? clamp((timer-interpolateTime.start)/(interpolateTime.end-interpolateTime.start), 0, 1): null"
      },
      {
        "name": "tEase",
        "description": "The easing calculation. Currently set as easeInOutCubic",
        "update": "t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1"
      },
      {
        "name": "interpolateTimeDelayed",
        "description": "The delayed time for easing",
        "on": [
          {
            "events": {"signal": "interpolateTime"},
            "update": "{'start': interpolateTime['end'], 'end': interpolateTime['end']+duration}"
          }
        ]
      },
      {
        "name": "tDelayed",
        "description": "The delayed normalized time for easing",
        "update": "interpolateTimeDelayed ? clamp((timer-interpolateTimeDelayed.start)/(interpolateTimeDelayed.end-interpolateTimeDelayed.start), 0, 1): null"
      },
      {
        "name": "tEaseDelayed",
        "description": "The delayed easing calculation. Currently set as easeInOutCubic",
        "update": "tDelayed < 0.5 ? 4 * tDelayed * tDelayed * tDelayed : (tDelayed - 1) * (2 * tDelayed - 2) * (2 * tDelayed - 2) + 1"
      }
    ],
    "data": [
      {
        "name": "source",
        "url": "data/flare.json",
        "transform": [
          {
            "type": "formula",
            "expr": "isValid(datum['parent']) ? datum['parent'] : null",
            "as": "parent"
          },
          {
            "type": "formula",
            "expr": "isValid(datum['size']) ? datum['size'] : null",
            "as": "size"
          }
        ]
      },
      {
        "name": "tree",
        "source": "source",
        "transform": [
          {"type": "stratify", "key": "id", "parentKey": "parent"},
          {
            "type": "pack",
            "field": "size",
            "sort": {"field": "value"},
            "size": [{"signal": "width"}, {"signal": "height"}]
          }
        ]
      },
      {
        "name": "focus0",
        "on": [{"trigger": "focus", "insert": "focus"}],
        "transform": [
          {"type": "formula", "expr": "now()", "as": "now"},
          {
            "type": "window",
            "ops": ["row_number"],
            "as": ["row"],
            "sort": {"field": "now", "order": "descending"}
          },
          {"type": "filter", "expr": "datum['row'] ? datum['row'] == 2 : true "},
          {"type": "project", "fields": ["id", "x", "y", "r", "children"]},
          {"type": "formula", "expr": "width/(datum['r']*2)", "as": "k"}
        ]
      }
    ],
    "scales": [
      {
        "name": "color",
        "type": "ordinal",
        "domain": {"data": "tree", "field": "depth"},
        "range": {"scheme": "magma"}
      }
    ],
    "marks": [
      
      {
        "name": "circles",
        "description": "the zoomable packed circles",
        "type": "symbol",
        "from": {"data": "tree"},
        "encode": {
          "enter": {
            "shape": {"value": "circle"},
            "fill": {"scale": "color", "field": "depth"},
            "cursor": {"value": "pointer"}
          },
          "update": {
            "x": {
              "signal": "lerp([root['x']+ (datum['x'] - focus0['x']) * focus0['k'], root['x'] + (datum['x'] - focus['x']) * k], tEase)"
            },
            "y": {
              "signal": "lerp([ root['y'] + (datum['y'] - focus0['y']) * focus0['k'],  root['y'] + (datum['y'] - focus['y']) * k], tEase)"
            },
            "size": {
              "signal": "pow(2*(datum['r'] * lerp([focus0['k'], k],tEase)),2)"
            },
            "fill": {
              "signal": "scale('color',datum['depth'])"
            },
            
            "stroke": "black",
            "strokeWidth": 2,
            "strokeOpacity": 1
          }
          
        }
      }
      
    ]
  }
}

async function renderStaticVisualization() {
  // render vega spec on screen
  await vega(document.getElementById("LibraPlayground"), globalThis.vegaSpec);
}

module.exports = {
  loadData,
  renderStaticVisualization,
};
