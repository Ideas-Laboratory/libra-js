// import static visualization and global variables
const VIS = require("./staticVisualization");

async function main() {
  await VIS.loadData();
  VIS.renderStaticVisualization();
  const mainLayers = renderMainVisualization();
  await mountInteraction(mainLayers);
}

function renderMainVisualization() {
  // Find the SVG element on page
  const svg = d3.select("#LibraPlayground svg");

  // Create the main layers
  const mainLayers = globalThis.fields.flatMap((_, x) =>
    globalThis.fields.map((_, y) => {
      const cellOffsetX = (x * globalThis.WIDTH) / globalThis.fields.length;
      const cellOffsetY = (y * globalThis.HEIGHT) / globalThis.fields.length;
      const layer = Libra.Layer.initialize("D3Layer", {
        name: "mainLayer",
        width:
          globalThis.WIDTH / globalThis.fields.length -
          globalThis.MARGIN.left -
          globalThis.MARGIN.right,
        height:
          globalThis.HEIGHT / globalThis.fields.length -
          globalThis.MARGIN.top -
          globalThis.MARGIN.bottom,
        offset: {
          x: cellOffsetX + globalThis.MARGIN.left * 2,
          y: cellOffsetY + globalThis.MARGIN.top * 2,
        },
        container: svg.node(),
      });
      renderMainLayer(
        layer,
        globalThis.data,
        globalThis.fields[x],
        globalThis.fields[y],
        globalThis.x[x],
        globalThis.y[y]
      );
      return layer;
    })
  );

  return mainLayers;
}

function renderMainLayer(layer, data, fieldX, fieldY, scaleX, scaleY) {
  const g = d3.select(layer.getGraphic());

  g.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("r", 3)
    .attr("cx", (d) => scaleX(d[fieldX]))
    .attr("cy", (d) => scaleY(d[fieldY]))
    .attr("fill", (d) => globalThis.color(d[globalThis.COLOR_FIELD]));
}

async function mountInteraction(mainLayers) {
  // Attach HoverInstrument to the main layer
  Libra.Interaction.build({
    inherit: "HoverInstrument",
    layers: mainLayers,
    sharedVar: {
      tooltip: {
        fields: ["class"],
        offset: {
          x: -20 - globalThis.MARGIN.left,
          y: -globalThis.MARGIN.top,
        },
      },
    },
  });
}

main();
