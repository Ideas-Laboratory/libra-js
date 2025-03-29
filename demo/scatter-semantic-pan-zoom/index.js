// import static visualization and global variables
const VIS = require("./staticVisualization");

async function main() {
  await VIS.loadData();
  VIS.renderStaticVisualization();
  const [mainLayer, transformer] = renderMainVisualization();
  mountInteraction(mainLayer, transformer);
}

function renderMainVisualization(
  scaleX = globalThis.x,
  scaleY = globalThis.y,
  data = globalThis.data_detail_level1
) {
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
        scaleY: globalThis.y,
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

  // Add X axis
  g.append("g")
    .attr("transform", "translate(0," + globalThis.HEIGHT + ")")
    .call(d3.axisBottom(scaleX))
    .append("text")
    .text(globalThis.FIELD_X)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("x", globalThis.WIDTH / 2)
    .attr("y", 30);

  // Add Y axis
  g.append("g")
    .call(d3.axisLeft(scaleY))
    .append("text")
    .text(globalThis.FIELD_Y)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("writing-mode", "tb")
    .style(
      "transform",
      `translate(${-globalThis.MARGIN.left / 2}px,${
        globalThis.HEIGHT / 2
      }px) rotate(180deg)`
    );

  // Draw points code from the input static visualization
  g.append("g")
    .attr("clip-path", `url(#clipMainLayer)`)
    .selectAll("g")
    .data(data)
    .join("g")
    .attr("class", "mark")
    .call((g) =>
      g
        .append("circle")
        .attr("fill", "white")
        .attr("stroke-width", 1)
        .attr("stroke", (d) => globalThis.color(d[globalThis.FIELD_COLOR]))
        .attr("cx", (d) => scaleX(d[globalThis.FIELD_X]))
        .attr("cy", (d) => scaleY(d[globalThis.FIELD_Y]))
        .attr("r", (d) => (d.count ?? 0) + 5)
    )
    .call((g) =>
      g
        .append("text")
        .attr("fill", (d) => globalThis.color(d[globalThis.FIELD_COLOR]))
        .attr("x", (d) => scaleX(d[globalThis.FIELD_X]) - 6)
        .attr("y", (d) => scaleY(d[globalThis.FIELD_Y]) + 6)
        .text((d) => ((d.count ?? 1) > 1 ? d.count : ""))
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
        3: { data: globalThis.data_detail_level0 },
        0: { data: globalThis.data_detail_level1 },
        "-3": { data: globalThis.data_detail_level2 },
        "-6": { data: globalThis.data_detail_level3 },
        "-9": { data: globalThis.data_detail_level4 },
        "-12": { data: globalThis.data_detail_level5 },
        "-15": { data: globalThis.data_detail_level6 },
      },
      fixRange: true,
      scaleX: globalThis.x,
      scaleY: globalThis.y,
    },
  });
}

main();
