// import static visualization and global variables
const VIS = require("./staticVisualization");

async function main() {
  await VIS.loadData();
  await VIS.renderStaticVisualization();
  const mainLayer = renderMainVisualization();
  console.log(mainLayer);
  mountInteraction(mainLayer);
}

function renderMainVisualization() {
  // Create the main layer
  const mainLayer = Libra.Layer.initialize("VegaLayer", {
    name: "mainLayer",
    group: "circles",
    container: document.querySelector("#LibraPlayground svg"),
  });
  console.log(mainLayer);
  return mainLayer;
}

function mountInteraction(layer) {

  Libra.GraphicalTransformer.register("renderTransformer", {
    layer: layer,
    // transient: true,
    redraw: function ({ layer, transformer }) {
      const result = transformer.getSharedVar("result");

      if (result) {
        function animateViewBox(start, end, duration) {
          var startTime;
          function animate(time) {
            if (!startTime) startTime = time;
    
            var progress = (time - startTime) / duration;
            if (progress > 1) progress = 1;
    
            // 计算中间帧的 viewBox
            var currentViewBox = {
              x: start.x + (end.x - start.x) * progress,
              y: start.y + (end.y - start.y) * progress,
              width: start.width + (end.width - start.width) * progress,
              height: start.height + (end.height - start.height) * progress,
            };
    
            // 应用中间帧的 viewBox
            layer._container.setAttribute('viewBox', `${currentViewBox.x} ${currentViewBox.y} ${currentViewBox.width} ${currentViewBox.height}`);
    
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          }
    
          requestAnimationFrame(animate);
        }
        animateViewBox(layer._container.viewBox.baseVal, result, 500)
      }

    },
  });

  globalThis.originViewBox = {
    x: 0,
    y: 0,
    width: 600,
    height: 600,
  }
  globalThis.currentViewBox = {

  }
  globalThis.moveViewAs = {}
  // Attach BrushInstrument to the main layer
  Libra.Interaction.build({
    inherit: "ClickInstrument",
    layers: [layer],
    remove: [{ find: "SelectionTransformer" }],
    insert: [
      {
        find: "SelectionService",
        flow: [
          {
            comp: "getMoveService",
            evaluate({
              result,
            }) {
              if (result.length) {
                const clickBox = {
                  x: result[0].__data__.bounds.x1,
                  y: result[0].__data__.bounds.y1,
                  width: result[0].__data__.bounds.x2 - result[0].__data__.bounds.x1,
                  height: result[0].__data__.bounds.y2 - result[0].__data__.bounds.y1,
                }
                for (let key in clickBox) {
                  if (!globalThis.currentViewBox[key] || !(globalThis.currentViewBox[key] == clickBox[key])) {
                    globalThis.currentViewBox = clickBox;
                    return clickBox
                  }
                }
                globalThis.currentViewBox = globalThis.originViewBox
                return globalThis.originViewBox
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
}

main();


