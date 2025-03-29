// import static visualization and global variables
const VIS = require("./staticVisualization");

async function main() {
  await VIS.loadData();
  VIS.renderStaticVisualization();
  const mainLayer = renderMainVisualization();
  mountInteraction(mainLayer);
}

function renderMainVisualization(data = globalThis.data) {
  // Find the SVG element on page
  const svg = d3.select("#LibraPlayground svg");

  let g = d3.select(".main");
  let returnVal = null;
  if (g.empty()) {
    // Create the main layer
    const mainLayer = Libra.Layer.initialize("D3Layer", {
      name: "mainLayer",
      width: globalThis.WIDTH,
      height: globalThis.HEIGHT,
      offset: {
        x: globalThis.VIEW_LAYOUTS.nodelink.margin.left,
        y: globalThis.VIEW_LAYOUTS.nodelink.margin.top,
      },
      container: svg.node(),
    });
    g = d3.select(mainLayer.getGraphic());
    g.attr("class", "main");
    returnVal = mainLayer;
  }

  // Clear the layer
  g.selectChildren().remove();

  // Draw links
  g.selectAll("line")
    .data(data.links)
    .join("line")
    .attr("class", "mark")
    .attr("x1", (d) => d.source.x)
    .attr("y1", (d) => d.source.y)
    .attr("x2", (d) => d.target.x)
    .attr("y2", (d) => d.target.y)
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.3);

  // Draw nodes
  g.selectAll("circle")
    .data(data.nodes)
    .join("circle")
    .attr("class", "mark")
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("fill", "steelblue")
    .attr("stroke", "#000")
    .attr("r", (d) => globalThis.radius(d.degree));

  return returnVal;
}

function mountInteraction(layer) {
  const mainTransformer = Libra.GraphicalTransformer.initialize(
    "MainTransformer",
    {
      layer: layer,
      sharedVar: {},
      redraw({ transformer }) {
        const result = transformer.getSharedVar("result");
        renderMainVisualization(result);
      },
    }
  );

  const layoutService = Libra.Service.initialize("LayoutService", {
    evaluate: ({ result, offsetx, offsety }) => {
      const datum = layer.getDatum(result);
      if (datum) {
        const mouseX = offsetx - globalThis.VIEW_LAYOUTS.nodelink.margin.left;
        const mouseY = offsety - globalThis.VIEW_LAYOUTS.nodelink.margin.top;
        datum.x = mouseX;
        datum.y = mouseY;
        // Perform force-directed layout
        d3.forceSimulation(globalThis.data.nodes)
          .force("charge", d3.forceManyBody().strength(-100))
          .force(
            "link",
            d3
              .forceLink(globalThis.data.links)
              .id((d) => d.id)
              .distance(0)
              .strength(0.3)
          )
          .force("x", d3.forceX())
          .force("y", d3.forceY())
          .force(
            "center",
            d3.forceCenter(
              (globalThis.VIEW_LAYOUTS.nodelink.width -
                globalThis.VIEW_LAYOUTS.nodelink.margin.left -
                globalThis.VIEW_LAYOUTS.nodelink.margin.right) /
                2 +
                globalThis.VIEW_LAYOUTS.nodelink.margin.left,
              (globalThis.VIEW_LAYOUTS.nodelink.height -
                globalThis.VIEW_LAYOUTS.nodelink.margin.top -
                globalThis.VIEW_LAYOUTS.nodelink.margin.bottom) /
                2 +
                globalThis.VIEW_LAYOUTS.nodelink.margin.top
            )
          )
          .stop()
          .tick(1);
        // Make the dragging node follow the mouse
        datum.x = mouseX;
        datum.y = mouseY;
      }
      return globalThis.data;
    },
  });

  Libra.Interaction.build({
    inherit: "DragInstrument",
    layers: [layer],
    remove: [
      {
        find: "SelectionTransformer",
      },
    ],
    insert: [
      {
        find: "SelectionService",
        flow: [layoutService, mainTransformer],
      },
    ],
  });
}

main();
