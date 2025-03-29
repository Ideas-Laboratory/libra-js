// import static visualization and global variables
const VIS = require("./staticVisualization");

async function main() {
  await VIS.loadData();
  VIS.renderStaticVisualization();
  const [mainLayer, widgetLayer] = renderMainVisualization();
  mountInteraction(mainLayer, widgetLayer);
}

function renderMainVisualization() {
  // append the svg object to the body of the page
  const svg = d3.select("#LibraPlayground svg");

  // create layer
  const mainLayer = Libra.Layer.initialize("D3Layer", {
    name: "mainLayer",
    width: globalThis.VIEW_LAYOUTS.nodelink.width,
    height: globalThis.VIEW_LAYOUTS.nodelink.height,
    offset: {
      x: globalThis.VIEW_LAYOUTS.nodelink.offset.x,
      y: globalThis.VIEW_LAYOUTS.nodelink.offset.y,
    },
    container: svg.node(),
  });
  const widgetLayer = Libra.Layer.initialize("Layer", {
    name: "widgetLayer",
    container: document.querySelector("#LibraPlayground"),
  });
  g = d3.select(mainLayer.getGraphic());

  renderNodeLink(mainLayer);

  widgetLayer._graphic = d3
    .select(widgetLayer.getContainerGraphic())
    .append("input")
    .attr("type", "range")
    .attr("min", globalThis.extent[0])
    .attr("max", globalThis.extent[1])
    .attr("step", 1)
    .attr("value", globalThis.extent[1])
    .attr(
      "style",
      `width:${
        globalThis.VIEW_LAYOUTS.histogram.width -
        globalThis.VIEW_LAYOUTS.histogram.margin.left -
        globalThis.VIEW_LAYOUTS.histogram.margin.right
      }px; margin-left: ${globalThis.VIEW_LAYOUTS.histogram.margin.left}px`
    )
    .node();

  return [mainLayer, widgetLayer];
}

function renderNodeLink(layer, value = globalThis.extent[1]) {
  const data = globalThis.data;
  const g = d3.select(layer.getGraphic());

  g.selectAll(".links, .nodes").remove();

  g.append("g")
    .attr("class", "links")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(data.links)
    .join("line")
    .attr("stroke-width", (d) => Math.sqrt(d.value))
    .attr("x1", (d) => d.source.x)
    .attr("y1", (d) => d.source.y)
    .attr("x2", (d) => d.target.x)
    .attr("y2", (d) => d.target.y);

  g.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(data.nodes)
    .join("circle")
    .attr("r", (d) => globalThis.radius(d.degree) + 5)
    .attr("fill", (d) => globalThis.color(d.degree))
    .attr("stroke", (d) => (d.degree >= value ? "orange" : "white"))
    .attr("stroke-width", (d) => (d.degree >= value ? 2 : 1))
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y);
}

function mountInteraction(mainLayer, widgetLayer) {
  Libra.GraphicalTransformer.register("NodeTransformer", {
    sharedVar: {
      widgetLayer,
    },
    redraw({ layer, transformer }) {
      const value = transformer.getSharedVar("widgetLayer").getGraphic().value;
      renderNodeLink(layer, value);
    },
  });

  Libra.Interaction.build({
    inherit: "DragInstrument",
    layers: [widgetLayer],
    insert: [
      {
        find: "SelectionService",
        flow: [
          {
            comp: "NodeTransformer",
            layer: mainLayer,
          },
        ],
      },
    ],
  });
}

main();
