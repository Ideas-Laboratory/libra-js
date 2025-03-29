// import static visualization and global variables
const VIS = require("./staticVisualization");

async function main() {
  await VIS.loadData();
  VIS.renderStaticVisualization();
  const mainLayer = renderMainVisualization();
  mountInteraction(mainLayer);
}

function renderMainVisualization() {
  // append the svg object to the body of the page
  const svg = d3.select("#LibraPlayground svg");

  // create layer
  const mainLayer = Libra.Layer.initialize("D3Layer", {
    name: "mainLayer",
    width: globalThis.WIDTH,
    height: globalThis.HEIGHT,
    offset: { x: globalThis.MARGIN.left, y: globalThis.MARGIN.top },
    container: svg.node(),
  });
  g = d3.select(mainLayer.getGraphic());

  // Draw the bars
  g.selectAll(".bar")
    .data(globalThis.data)
    .join("rect")
    .attr("class", "bar")
    .attr("opacity", "1")
    .attr("fill", "steelblue")
    .attr("stroke", "#fff")
    .attr("x", (d) => globalThis.x(d.name))
    .attr("y", (d) => globalThis.y(d.value))
    .attr("height", (d) => {
      return globalThis.y(0) - globalThis.y(d.value);
    })
    .attr("width", globalThis.x.bandwidth());

  return mainLayer;
}

function mountInteraction(layer) {
  Libra.Interaction.build({
    inherit: "BrushInstrument",
    layers: [layer],
    remove: [{ find: "SelectionTransformer" }],
    insert: [
      {
        find: "SelectionService",
        flow: [
          {
            comp: "RegressionService",
            sharedVar: {
              xField: (d) => globalThis.x(d.name),
              yField: (d) => globalThis.y(d.value),
            },
          },
          {
            comp: "LineTransformer",
            layer: layer.getLayerFromQueue("regressionLayer"),
            sharedVar: {
              style: {
                stroke: "red",
                "stroke-width": 5,
              },
            },
          },
        ],
      },
      {
        find: "SelectionService",
        flow: [
          {
            comp: "SelectionTransformer",
            transient: true,
            layer: layer.getLayerFromQueue("annotationLayer"),
            sharedVar: {
              highlightColor: "red",
              tooltip: {
                fields: ["value"],
                position: "absolute",
                offset: {
                  y: -10,
                },
              },
            },
          },
        ],
      },
      {
        find: "SelectionService",
        flow: [
          {
            comp: "ReverseSelectionService",
            name: "unselectedService",
          },
          {
            comp: "RegressionService",
            sharedVar: {
              xField: (d) => globalThis.x(d.name),
              yField: (d) => globalThis.y(d.value),
            },
          },
          {
            comp: "LineTransformer",
            layer: layer.getLayerFromQueue("regressionLayer"),
            sharedVar: {
              style: {
                stroke: "green",
                "stroke-width": 5,
              },
            },
          },
        ],
      },
      {
        find: "unselectedService",
        flow: [
          {
            comp: "SelectionTransformer",
            transient: true,
            layer: layer.getLayerFromQueue("annotationLayer"),
            sharedVar: {
              highlightColor: "green",
              tooltip: {
                fields: ["value"],
                position: "absolute",
                offset: {
                  y: 20,
                },
              },
            },
          },
        ],
      },
    ],
  });
}

main();
