// import static visualization and global variables
const VIS = require("./staticVisualization");

async function main() {
  await VIS.loadData();
  VIS.renderStaticVisualization();
  const [bgLayer, linkLayer, nodeLayer] = renderMainVisualization();
  mountInteraction(bgLayer, linkLayer, nodeLayer);
}

function renderMainVisualization(
  nodes = globalThis.nodes,
  links = globalThis.links
) {
  // append the svg object to the body of the page
  const svg = d3.select("#LibraPlayground svg");

  let g = svg.select(".node");
  let returnVal = null;
  if (g.empty()) {
    // create layer if not exists
    const linkLayer = Libra.Layer.initialize("D3Layer", {
      name: "linkLayer",
      width: globalThis.WIDTH,
      height: globalThis.HEIGHT,
      offset: { x: globalThis.MARGIN.left, y: globalThis.MARGIN.top },
      container: svg.node(),
    });
    g = d3.select(linkLayer.getGraphic());
    g.attr("class", "link");

    const nodeLayer = linkLayer.getLayerFromQueue("nodeLayer");
    d3.select(nodeLayer.getGraphic()).attr("class", "node");

    const bgLayer = linkLayer.getLayerFromQueue("backgroundLayer");

    returnVal = [bgLayer, linkLayer, nodeLayer];
  }

  renderNodeVisualization(nodes);
  // renderLinkVisualization(links);

  return returnVal;
}

function renderNodeVisualization(nodes = globalThis.nodes) {
  // find node layer
  const root = d3.select("#LibraPlayground").select(".node");

  // clear graphical elements
  root.selectChildren().remove();

  // draw nodes
  root
    .append("g")
    .attr("fill", "#fff")
    .attr("stroke", "#000")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("fill", (d) => (d.children ? null : "steelblue"))
    .attr("r", (d) => {
      const a = d.children
        ? null
        : globalThis.radius(d[globalThis.FIELD_RADIUS]);
      return a;
    })
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y);
}

function renderLinkVisualization(links = globalThis.links) {
  // find link layer
  const root = d3.select("#LibraPlayground").select(".link");

  // clear graphical elements
  root.selectChildren().remove();

  // draw links
  root
    .append("g")
    .attr("fill", "none")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll("path")
    .data(links)
    .join("path")
    .attr("d", (d) => d);
}

function mountInteraction(bgLayer, linkLayer, nodeLayer) {
  // register fisheye layout service
  Libra.Service.register("FisheyeLayoutService", {
    constructor: Libra.Service.LayoutService,
    params: { edges: [], vertices: [], controlPoints: [] },
    evaluate({ edges, vertices, controlPoints }) {
      const line = d3
        .line(
          (d) => d.x,
          (d) => d.y
        )
        .curve(d3.curveBasis);
      if (controlPoints.length <= 0 || vertices.length <= 0) {
        return {
          vertices,
          edges: edges
            .map((edge) => [edge.source, edge.target])
            .map((x) => line(x)),
        };
      }
      const fisheye = d3
        .circular()
        .radius(globalThis.FISHEYE_LENS)
        .distortion(2);
      const controlPoint = controlPoints[0];
      fisheye.focus([controlPoint.x, controlPoint.y]);

      return {
        vertices: vertices.map((x) => {
          const f = fisheye([x.x, x.y]);
          return { ...x, x: f[0], y: f[1] };
        }),
        edges: edges
          .map((edge) => {
            const source = fisheye([edge.source.x, edge.source.y]);
            const target = fisheye([edge.target.x, edge.target.y]);
            return [
              { x: source[0], y: source[1] },
              { x: target[0], y: target[1] },
            ];
          })
          .map((x) => line(x)),
      };
    },
  });

  // register node & link transformers
  Libra.GraphicalTransformer.register("NodeTransformer", {
    redraw({ transformer }) {
      const nodes = transformer.getSharedVar("result")?.vertices ?? [];
      renderNodeVisualization(nodes);
    },
  });

  Libra.GraphicalTransformer.register("LinkTransformer", {
    redraw({ transformer }) {
      const links = transformer.getSharedVar("result")?.edges ?? [];
      renderLinkVisualization(links);
    },
  });

  const nodeTransformer = Libra.GraphicalTransformer.initialize(
    "NodeTransformer",
    {
      layer: nodeLayer,
    }
  );

  const linkTransformer = Libra.GraphicalTransformer.initialize(
    "LinkTransformer",
    {
      layer: linkLayer,
    }
  );

  // compose hover instrument with customized service
  Libra.Instrument.initialize("HoverInstrument", {
    layers: [bgLayer],
    services: [
      Libra.Service.initialize("FisheyeLayoutService", {
        sharedVar: {
          vertices: globalThis.nodes,
          edges: globalThis.links,
        },
        transformers: [nodeTransformer, linkTransformer],
      }),
    ],
    on: {
      hover: [
        ({ event, instrument }) => {
          instrument.services.setSharedVar("controlPoints", [
            { x: event.offsetX, y: event.offsetY },
          ]);
        },
      ],
    },
  });
}

main();
