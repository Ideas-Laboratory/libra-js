// import static visualization and global variables
const VIS = require("./staticVisualization");

async function main() {
  await VIS.loadData();
  VIS.renderStaticVisualization();
  const [mainLayer, transformer] = renderMainVisualization();
  mountInteraction(mainLayer, transformer);
}

function renderMainVisualization(scaleX = globalThis.x, scaleY = globalThis.y) {
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

  // Draw the map
  const path = d3.geoPath();

  g.selectAll(".counties")
    .data(globalThis.data)
    .join("g")
    .attr("class", "counties")
    .attr(
      "transform",
      `translate(${scaleX(0)}, ${scaleY(0)}) scale(${scaleX(1) - scaleX(0)})`
    )
    .call((g) =>
      g
        .append("path")
        .attr("d", path)
        .attr("fill", "#b7dbff")
        .append("title")
        .text("counties")
    )
    .call((g) =>
      g
        .append("text")
        .text((d) => d.properties.county)
        .attr("transform", function (d) {
          const centroid = path.centroid(d);
          return `translate(${centroid[0]},${centroid[1]})`;
        })
        .style("pointer-events", "none")
        .attr("font-size", 8)
        .attr("text-anchor", "middle")
        .attr("font-family", "sans-serif")
        .attr("class", "county-names")
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
    inherit: "GeometricZoomInstrument",
    layers: [layer],
    sharedVar: {
      fixRange: true,
      scaleX: globalThis.x,
      scaleY: globalThis.y,
    },
  });
}

main();
