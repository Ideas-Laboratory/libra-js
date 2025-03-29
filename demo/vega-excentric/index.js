// import static visualization and global variables
const VIS = require("./staticVisualization");
// register excentricLabelingInstrument
require("./excentricLabelingInstrument");

async function main() {
  await VIS.loadData();
  await VIS.renderStaticVisualization();
  const mainLayer = renderMainVisualization();
  mountInteraction(mainLayer);
}

function renderMainVisualization() {
  // Create the main layer
  const mainLayer = Libra.Layer.initialize("VegaLayer", {
    name: "mainLayer",
    group: "marks",
    container: document.querySelector("#LibraPlayground svg"),
  });

  return mainLayer;
}

function mountInteraction(layer) {
  Libra.Interaction.build({
    inherit: "ExcentricLabelingInstrument",
    layers: [layer],
    sharedVar: {
      labelAccessor: (circleElem) => circleElem.__data__.datum.Name,
      colorAccessor: (circleElem) => circleElem.__data__.stroke,
    },
  });
}

main();
