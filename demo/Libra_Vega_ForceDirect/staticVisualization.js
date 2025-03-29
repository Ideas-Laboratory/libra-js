// global variables
globalThis.vegaSpec = {};

async function loadData() {
    globalThis.vegaSpec = {
        "$schema": "https://vega.github.io/schema/vega/v5.json",
        "description": "A node-link diagram with force-directed layout, depicting character co-occurrence in the novel Les Misérables.",
        "width": 600,
        "height": 600,
        "padding": 0,
        "autosize": "none",
        "signals": [
            { "name": "cx", "update": "width / 2" },
            { "name": "cy", "update": "height / 2" },
            {
                "name": "nodeRadius",
                "value": 8,
                "bind": { "input": "range", "min": 1, "max": 50, "step": 1 }
            },
            {
                "name": "nodeCharge",
                "value": -30,
                "bind": { "input": "range", "min": -100, "max": 10, "step": 1 }
            },
            {
                "name": "linkDistance",
                "value": 30,
                "bind": { "input": "range", "min": 5, "max": 100, "step": 1 }
            },

            {
                "description": "Graph node most recently interacted with.",
                "name": "node",
                "value": null
            }
        ],
        "data": [
            {
                "name": "node-data",
                "url": "data/miserables2.json",
                "format": { "type": "json", "property": "nodes" }
            },
            {
                "name": "link-data",
                "url": "data/miserables2.json",
                "format": { "type": "json", "property": "links" }
            }
        ],
        "scales": [
            {
                "name": "color",
                "type": "ordinal",
                "domain": { "data": "node-data", "field": "group" },
                "range": { "scheme": "category20c" }
            }
        ],
        "marks": [
            {
                "name": "nodes",
                "type": "symbol",
                "zindex": 1,
                "from": { "data": "node-data" },

                "encode": {
                    "enter": {
                        "x": { "value": 300 },
                        "y": { "value": 300 },
                        "fill": { "scale": "color", "field": "group" },
                        "stroke": { "value": "white" }
                    },
                    "update": {
                        "size": { "signal": "2 * nodeRadius * nodeRadius" },
                        "cursor": { "value": "pointer" }
                    }
                },

            },
            {
                "name": "links",
                "type": "path",
                "from": { "data": "link-data" },
                "interactive": false,
                "encode": {
                    "update": { "stroke": { "value": "#ccc" }, "strokeWidth": { "value": 0.5 } },
            },
            

            }
        ],
    "config": { }
};
}

async function renderStaticVisualization() {
    // render vega spec on screen
    await vega(document.getElementById("LibraPlayground"), globalThis.vegaSpec);
}

module.exports = {
    loadData,
    renderStaticVisualization,
};
