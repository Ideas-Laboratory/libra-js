// import static visualization and global variables
const VIS = require("./staticVisualization");

async function main() {
  await VIS.loadData();
  VIS.renderStaticVisualization();
  const [layer, transformer] = renderMainVisualization();
  mountInteraction(layer, transformer);
}

function renderMainVisualization(
  scaleX = globalThis.x,
  scaleY = globalThis.y,
  data = globalThis.data_detail_level1
) {
  // append the svg object to the body of the page
  const svg = d3.select("#LibraPlayground svg");

  let g = svg.select(".main");
  let returnVal = null;
  if (g.empty()) {
    // create layer if not exists
    const mainLayer = Libra.Layer.initialize("D3Layer", {
      name: "mainLayer",
      width: globalThis.WIDTH,
      height: globalThis.HEIGHT,
      offset: { x: globalThis.MARGIN.left, y: globalThis.MARGIN.top },
      container: svg.node(),
    });
    g = d3.select(mainLayer.getGraphic());
    g.attr("class", "main");

    Libra.GraphicalTransformer.register("DrawAxesAndMarks", {
      sharedVar: {
        scaleX: globalThis.x,
        scaleY: globalThis.y,
        data: globalThis.data_detail_level1,
      },
      redraw({ transformer }) {
        const scaleX = transformer.getSharedVar("scaleX");
        const scaleY = transformer.getSharedVar("scaleY");
        const data = transformer.getSharedVar("data");
        renderMainVisualization(scaleX, scaleY, data);
      },
    });

    const transformer = Libra.GraphicalTransformer.initialize(
      "DrawAxesAndMarks",
      {
        layer: mainLayer,
      }
    );

    returnVal = [mainLayer, transformer];
  }

  // Clear the layer
  g.selectChildren().remove();

  // Draw the treemap
  g.selectAll(".block")
    .data(data)
    .join("g")
    .attr("class", "block")
    .call((g) =>
      g
        .append("rect")
        .attr("fill", "blue")
        .attr("x", function (d) {
          return scaleX(d.x0);
        })
        .attr("y", function (d) {
          return scaleY(d.y0);
        })
        .attr("width", function (d) {
          return scaleX(d.x1) - scaleX(d.x0);
        })
        .attr("height", function (d) {
          return scaleY(d.y1) - scaleY(d.y0);
        })
    )
    .call((g) =>
      g
        .append("text")
        .attr("x", function (d) {
          return scaleX(d.x0) + 5;
        }) // +10 to adjust position (more right)
        .attr("y", function (d) {
          return scaleY(d.y0) + 20;
        }) // +20 to adjust position (lower)
        .text(function (d) {
          return d.data.name;
        })
        .attr("font-size", "15px")
        .attr("fill", "white")
    );

  return returnVal;
}

function mountInteraction(layer, transformer) {
  Libra.Interaction.build({
    inherit: "PanInstrument",
    layers: [layer],
    sharedVar: {
      fixRange: true,
      scaleX: globalThis.x,
      scaleY: globalThis.y,
    },
  });

  Libra.Interaction.build({
    inherit: "SemanticZoomInstrument",
    layers: [layer],
    sharedVar: {
      scaleLevels: {
        0: { data: globalThis.data_detail_level1 },
        3: { data: globalThis.data_detail_level2 },
        6: { data: globalThis.data_detail_level3 },
      },
      fixRange: true,
      scaleX: globalThis.x,
      scaleY: globalThis.y,
    },
  });
}

main();
