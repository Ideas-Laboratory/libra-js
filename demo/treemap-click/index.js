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

  // Draw the treemap
  g.selectAll(".block")
    .data(globalThis.data_detail_level1)
    .join("g")
    .attr("class", "block")
    .call((g) =>
      g
        .append("rect")
        .attr("fill", "blue")
        .attr("x", function (d) {
          return d.x0;
        })
        .attr("y", function (d) {
          return d.y0;
        })
        .attr("width", function (d) {
          return d.x1 - d.x0;
        })
        .attr("height", function (d) {
          return d.y1 - d.y0;
        })
    )
    .call((g) =>
      g
        .append("text")
        .attr("x", function (d) {
          return d.x0 + 5;
        }) // +10 to adjust position (more right)
        .attr("y", function (d) {
          return d.y0 + 20;
        }) // +20 to adjust position (lower)
        .text(function (d) {
          return d.data.name;
        })
        .attr("font-size", "15px")
        .attr("fill", "white")
    );

  return mainLayer;
}

function mountInteraction(layer) {
  Libra.Interaction.build({
    inherit: "ClickInstrument",
    layers: [layer],
    sharedVar: {
      highlightColor: "red",
      deepClone: true,
    },
  });
}

main();
