// import static visualization and global variables
const VIS = require("./staticVisualization");

const FIELDS = ["delay", "time", "distance"];

async function main() {
  await VIS.loadData();
  await VIS.renderStaticVisualization();
  const [histLayers, transformer] = renderMainVisualization();
  mountInteraction(histLayers, transformer);
}

function renderMainVisualization() {
  // Create the main layer
  const histLayers = [];
  FIELDS.forEach((field, i) => {
    const layer = Libra.Layer.initialize("VegaLayer", {
      name: "mainLayer",
      group: field + "-bars",
      container: document.querySelector("#LibraPlayground svg"),
    });
    layer._width = 500;
    layer._height = 100;
    layer
      .getLayerFromQueue("transientLayer")
      .getGraphic()
      .setAttribute(
        "transform",
        `translate(${layer._offset.x}, ${layer._offset.y})`
      );
    layer.setLayersOrder({ selectionLayer: -1 });
    histLayers.push(layer);
  });

  const transformer = Libra.GraphicalTransformer.initialize(
    "HistogramTransformer",
    {
      layer: histLayers[0],
      sharedVar: {
        result: globalThis.data,
      },
      async redraw({ transformer }) {
        globalThis.vegaView.data(
          "filtered",
          transformer.getSharedVar("result")
        );
        await globalThis.vegaView.runAsync();
      },
    }
  );

  return [histLayers, transformer];
}

function mountInteraction(histLayers, transformer) {
  Libra.Interaction.build({
    inherit: "BrushXInstrument",
    layers: histLayers,
    insert: [
      {
        find: "BrushXInstrument",
        flow: [
          (layer, i) => ({
            name: "CrossfilterService",
            comp: "QuantitativeSelectionService",
            layers: [layer],
            dimension: FIELDS[i],
            sharedVar: {
              scaleX: globalThis.x[FIELDS[i]],
              height: 100,
            },
          }),
          {
            comp: "FilterService",
            sharedVar: {
              data: globalThis.data,
            },
          },
          transformer,
        ],
      },
    ],
  });
}

main();
