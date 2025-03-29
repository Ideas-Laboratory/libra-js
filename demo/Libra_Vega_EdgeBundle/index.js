// import static visualization and global variables
const VIS = require("./staticVisualization");

async function main() {
  await VIS.loadData();
  await VIS.renderStaticVisualization();
  const [mainLayer, curveLayer] = renderMainVisualization();
  console.log(mainLayer);
  console.log(curveLayer);
  mountInteraction(mainLayer, curveLayer);
}

function renderMainVisualization() {
  // Create the main layer
  const mainLayer = Libra.Layer.initialize("VegaLayer", {
    name: "mainLayer",
    group: "texts",
    container: document.querySelector("#LibraPlayground svg"),
  });
  const curveLayer = Libra.Layer.initialize("VegaLayer", {
    name: "curveLayer",
    group: "curves",
    container: document.querySelector("#LibraPlayground svg"),
  });
  return [mainLayer, curveLayer];
}

function mountInteraction(textLayer, curveLayer) {

  Libra.GraphicalTransformer.register("renderTransformer", {
    layer: curveLayer,
    // transient: true,
    redraw: function ({ layer, transformer }) {
      const result = transformer.getSharedVar("result");
      console.log(result);
      if (result) {
        result.greenCurve.forEach(c => {
          c.children[1].firstChild.firstChild.setAttribute('stroke', 'green')
          c.children[1].firstChild.firstChild.setAttribute('stroke-opacity', '1')
        })
        result.redCurve.forEach(c => {
          c.children[1].firstChild.firstChild.setAttribute('stroke', 'red')
          c.children[1].firstChild.firstChild.setAttribute('stroke-opacity', '1')
        })
        result.greenText.forEach(c => {
          c.setAttribute('fill', 'green')
        })
        result.redText.forEach(c => {
          c.setAttribute('fill', 'red')
        })
      }

    },
  });


  // Attach BrushInstrument to the main layer
  Libra.Interaction.build({
    inherit: "HoverInstrument",
    layers: [textLayer],
    remove: [{ find: "SelectionTransformer" }],
    insert: [
      {
        find: "SelectionService",
        flow: [
          {
            comp: "hierarchyAnalyseService",
            evaluate({
              result,
            }) {
              if (result.length) {
                let analyseResult = {
                  greenText: [],
                  redText: [],
                  greenCurve: [],
                  redCurve: [],
                  onHover: result[0],
                }

                Array.from(curveLayer._graphic.children).forEach(d => {
                  if (d.__data__.datum.source == result[0].__data__.datum.id) {
                    analyseResult.greenCurve.push(d)
                    Array.from(textLayer._graphic.children).forEach(t => {
                      if (t.__data__.datum.id == d.__data__.datum.target) {
                        console.log(t.__data__.datum.id + "==" + d.__data__.datum.target);
                        analyseResult.greenText.push(t)
                      }
                    })
                  }
                  else if (d.__data__.datum.target == result[0].__data__.datum.id) {
                    analyseResult.redCurve.push(d)
                    Array.from(textLayer._graphic.children).forEach(t => {
                      if (t.__data__.datum.id == d.__data__.datum.source) {
                        console.log(t.__data__.datum.id + "==" + d.__data__.datum.source);
                        analyseResult.redText.push(t)
                      }
                    })
                  }
                })
                return analyseResult;
              }
            },
          },
          {
            comp: "renderTransformer"
          }
        ],
      }
    ],
  });


  // Libra.Interaction.build({
  //   inherit: "HoverInstrument",
  //   layers: [textLayer],
  //   sharedVar: {
  //     highlightAttrValues: { stroke: "red" },
  //   },
  // });
}

main();
