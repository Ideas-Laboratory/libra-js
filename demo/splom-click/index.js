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
    .attr("fill", "#999");
}

function renderHighlightLayer(layer, data, fieldX, fieldY, scaleX, scaleY) {
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
  const highlightTransformers = mainLayers.map((layer, i) => {
    const y = i % globalThis.fields.length;
    const x = Math.floor(i / globalThis.fields.length);
    return Libra.GraphicalTransformer.initialize("SelectionTransformer", {
      layer: layer.getLayerFromQueue("selectionLayer"),
      redraw({ layer, transformer }) {
        const result = transformer.getSharedVar("result") || [];
        const data = result.map((d) => layer.getDatum(d));
        renderHighlightLayer(
          layer,
          data,
          globalThis.fields[x],
          globalThis.fields[y],
          globalThis.x[x],
          globalThis.y[y]
        );
      },
    });
  });

  mainLayers.forEach((layer) => {
    Libra.Interaction.build({
      inherit: "ClickInstrument",
      layers: [layer],
      remove: [
        {
          find: "SelectionTransformer",
        },
      ],
      insert: [
        {
          find: "SelectionService",
          flow: [
            {
              comp: "FilterService",
              sharedVar: {
                fields: ["class"],
              },
            },
            highlightTransformers,
          ],
        },
      ],
      sharedVar: {
        highlightAttrValues: {
          fill: (d) => globalThis.color(d[globalThis.COLOR_FIELD]),
        },
      },
    });
  });
}

main();
