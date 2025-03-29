// import static visualization and global variables
const VIS = require("./staticVisualization");

async function main() {
  await VIS.loadData();
  VIS.renderStaticVisualization();
  const [mainLayer, transformer] = renderMainVisualization();
  mountInteraction(mainLayer);
}

function renderMainVisualization(scaleX = globalThis.x, scaleY = globalThis.y) {
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
      container: svg.node(),
    });
    g = d3.select(mainLayer.getGraphic());
    g.attr("class", "main");

    Libra.GraphicalTransformer.register("DrawAxesAndMarks", {
      sharedVar: {
        scaleX: globalThis.x,
        scaleY: globalThis.y,
      },
      redraw({ transformer }) {
        const scaleX = transformer.getSharedVar("scaleX");
        const scaleY = transformer.getSharedVar("scaleY");
        renderMainVisualization(scaleX, scaleY);
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

  // Add the horizontal axis.
  g.append("g")
    .attr("transform", `translate(0,${globalThis.HEIGHT - globalThis.MARGIN.bottom})`)
    .call(d3.axisBottom(scaleX).ticks(globalThis.WIDTH / 80).tickSizeOuter(0));

  // Add the vertical axis.
  g.append("g")
    .attr("transform", `translate(${globalThis.MARGIN.left},0)`)
    .call(d3.axisLeft(scaleY))
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll(".tick line").clone()
      .attr("x2", globalThis.WIDTH - globalThis.MARGIN.left - globalThis.MARGIN.right)
      .attr("stroke-opacity", 0.1))
    .call(g => g.append("text")
      .attr("x", -globalThis.MARGIN.left)
      .attr("y", 10)
      .attr("fill", "currentColor")
      .attr("text-anchor", "start")
      .text("↑ Unemployment (%)"));


  // Compute the points in pixel space as [x, y, z], where z is the name of the series.
  const points = globalThis.data.map((d) => [scaleX(d.date), scaleY(d.unemployment), d.division]);

  // Group the points by series.
  const groups = d3.rollup(points, v => Object.assign(v, { z: v[0][2] }), d => d[2]);

  // Draw lines code from the input static visualization
  g.append('g')
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .selectAll("path")
    .data(groups.values())
    .join("path")
    .style("mix-blend-mode", "multiply")
    .attr("d", d3.line());

  return returnVal;
}

function mountInteraction(layer) {
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
    inherit: "GeometricZoomInstrument",
    layers: [layer],
    sharedVar: {
      scaleX: globalThis.x,
      scaleY: globalThis.y,
    },
  });
}

main();
