// import static visualization and global variables
const VIS = require("./staticVisualization");

async function main() {
  await VIS.loadData();
  VIS.renderStaticVisualization();
  const [mainLayer, transformer] = renderMainVisualization();
  mountInteraction(mainLayer, transformer);
}

function renderMainVisualization(scaleX = globalThis.x) {
  // Find SVG
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
      },
      redraw({ transformer }) {
        const scaleX = transformer.getSharedVar("scaleX");
        renderMainVisualization(scaleX);
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

  // Add X axis
  g.append("g")
    .attr("transform", "translate(0," + globalThis.HEIGHT + ")")
    .call(d3.axisBottom(scaleX).tickSizeOuter(0))
    .call((g) =>
      g
        .selectAll(".tick line")
        .clone()
        .attr("stroke-opacity", 0.1)
        .attr("y2", -globalThis.HEIGHT)
    );

  // Draw bars code from the input static visualization
  g.append("g")
    .attr("clip-path", `url(#clipMainLayer-brush)`)
    .selectAll(".bar")
    .data(globalThis.data)
    .join("rect")
    .attr("class", "bar")
    .attr("opacity", "1")
    .attr("fill", "steelblue")
    .attr("stroke", "#fff")
    .attr("x", (d) => scaleX(d.name))
    .attr("y", (d) => globalThis.y(d.value))
    .attr("height", (d) => {
      return globalThis.y(0) - globalThis.y(d.value);
    })
    .attr("width", scaleX.bandwidth());

  return returnVal;
}

function mountInteraction(layer, transformer) {
  Libra.Interaction.build({
    inherit: "PanInstrument",
    layers: [layer],
    sharedVar: {
      scaleX: globalThis.x,
    },
  });

  Libra.Interaction.build({
    inherit: "GeometricZoomInstrument",
    layers: [layer],
    sharedVar: {
      scaleX: globalThis.x,
    },
  });
}

main();
