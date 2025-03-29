// import static visualization and global variables
const VIS = require("./staticVisualization");

async function main() {
  await VIS.loadData();
  await VIS.renderStaticVisualization();
  const [mainLayer, mainTransformer] = renderMainVisualization();
  mountInteraction(mainLayer, mainTransformer);
}

function renderMainVisualization() {
  // Create the main layer
  const mainLayer = Libra.Layer.initialize("VegaLayer", {
    name: "mainLayer",
    group: "marks",
    container: document.querySelector("#LibraPlayground svg"),
  });

  // Initialize Main Transformer
  const mainTransformer = Libra.GraphicalTransformer.register(
    "MainTransformer",
    {
      layer: mainLayer,
      sharedVar: {
        result: new Date(2004, 0, 1),
      },
      async redraw({ transformer }) {
        const date = transformer.getSharedVar("result");
        globalThis.vegaView.signal("currentDate", date.toString());
        await globalThis.vegaView.runAsync();
      },
    }
  );

  return [mainLayer, mainTransformer];
}

function mountInteraction(layer, transformer) {
  Libra.Service.register("ReverseScaleService", {
    sharedVar: {
      scaleX: globalThis.x,
    },
    evaluate({ event, scaleX }) {
      if (!event) return new Date(2004, 0, 1);
      const x = scaleX.invert(event.x);
      return x;
    },
  });

  // Attach HoverInstrument to the main layer
  Libra.Interaction.build({
    inherit: "HoverInstrument",
    layers: [layer],
    insert: [
      {
        find: "SelectionService",
        flow: [
          { comp: "ReverseScaleService" },
          {
            comp: "MainTransformer",
          },
        ],
      },
    ],
  });
}

main();
