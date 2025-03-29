// import static visualization and global variables
const VIS = require("./staticVisualization");

async function main() {
  await VIS.loadData();
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
  const g = d3.select(mainLayer.getGraphic());

  // Draw points code from the input static visualization
  g.selectAll("circle")
    .data(globalThis.data)
    .join("circle")
    .attr("class", "mark")
    .attr("fill", "white")
    .attr("stroke-width", 1)
    .attr("stroke", "gray")
    .attr("cx", (d) => globalThis.x(d[globalThis.FIELD_X]))
    .attr("cy", (d) => globalThis.y(d[globalThis.FIELD_Y]))
    .attr("r", 5);

  return mainLayer;
}

function mountInteraction(layer) {
  // Attach HoverInstrument to the main layer
  Libra.Interaction.build({
    inherit: "HoverInstrument",
    layers: [layer],
    sharedVar: {
      highlightColor: (d) => 'red',
    },
  });
}

main();
