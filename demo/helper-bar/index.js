// import static visualization and global variables
const VIS = require("./staticVisualization");

async function main() {
  VIS.loadData();
  VIS.renderStaticVisualization();
  const mainLayer = renderMainVisualization();
  mountInteraction(mainLayer);
}

function renderMainVisualization() {
  // Find the SVG element on page
  const svg = d3.select("#LibraPlayground svg");

  // Create the main layer
  const mainLayer = Libra.Layer.initialize("D3Layer", {
    name: "mainLayer",
    width: globalThis.WIDTH,
    height: globalThis.HEIGHT,
    offset: { x: globalThis.MARGIN.left, y: globalThis.MARGIN.top },
    container: svg.node(),
  });
  g = d3.select(mainLayer.getGraphic());

  // Draw bars code from the input static visualization
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
  // Attach HoverInstrument to the main layer
  Libra.Interaction.build({
    inherit: "HoverInstrument",
    layers: [layer],
    insert: [
      {
        find: "SelectionService",
        flow: [
          {
            comp: "LineTransformer",
            sharedVar: {
              orientation: ["horizontal"],
              scaleY: globalThis.y,
            },
          },
        ],
      },
    ],
    sharedVar: {
      tooltip: {
        prefix: "Frequency: ",
      },
    },
  });
}

main();
