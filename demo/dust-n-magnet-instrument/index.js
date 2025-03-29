// import static visualization and global variables
const VIS = require("./staticVisualization");

async function main() {
  await VIS.loadData();
  VIS.renderStaticVisualization();
  const [bgLayer, dustLayer, magnetLayer] = renderMainVisualization();
  mountInteraction(bgLayer, dustLayer, magnetLayer);
}

function renderMainVisualization() {
  // append the svg object to the body of the page
  const svg = d3.select("#LibraPlayground svg");

  // create layer
  const dustLayer = Libra.Layer.initialize("D3Layer", {
    name: "dustLayer",
    width: globalThis.WIDTH,
    height: globalThis.HEIGHT,
    offset: { x: globalThis.MARGIN.left, y: globalThis.MARGIN.top },
    container: svg.node(),
  });
  const magnetLayer = dustLayer.getLayerFromQueue("magnetLayer");
  const backgroundLayer = dustLayer.getLayerFromQueue("backgroundLayer");
  d3.select(dustLayer.getGraphic()).attr("class", "dust");
  d3.select(magnetLayer.getGraphic()).attr("class", "magnet");

  dustLayer.setLayersOrder({
    backgroundLayer: 0,
    dustLayer: 1,
    magnetLayer: 2,
  });

  d3.select(backgroundLayer.getGraphic())
    .select("rect")
    .attr("stroke", "#000")
    .attr("fill", "none")
    .attr("opacity", 1);

  renderDust();
  renderMagnet();

  return [backgroundLayer, dustLayer, magnetLayer];
}

function renderDust(data = globalThis.data) {
  d3.select("#LibraPlayground svg .dust")
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("stroke", "#000")
    .attr("fill", "#B9B9B9")
    .attr("r", 10);
}

function renderMagnet(data = globalThis.magnet) {
  d3.select("#LibraPlayground svg .magnet")
    .call((g) => g.selectChildren().remove())
    .selectAll("g")
    .data(data)
    .enter()
    .append("g")
    .call((g) =>
      g
        .append("rect")
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y)
        .attr("width", 50)
        .attr("height", 50)
        .attr("fill", "orange")
    )
    .call((g) =>
      g
        .append("text")
        .attr("x", (d) => d.x + 50 / 2)
        .attr("y", (d) => d.y + 50 / 2)
        .attr("text-anchor", "middle")
        .text((d) => d.property)
    );
}

function mountInteraction(bgLayer, dustLayer, magnetLayer) {
  const dustTransformer = Libra.GraphicalTransformer.initialize(
    "DustTransformer",
    {
      layer: dustLayer,
      sharedVar: { result: globalThis.data },
      redraw({ transformer }) {
        const dusts = transformer.getSharedVar("result");
        renderDust(dusts);
      },
    }
  );

  const magnetTransformer = Libra.GraphicalTransformer.initialize(
    "MagnetTransformer",
    {
      layer: magnetLayer,
      sharedVar: { result: globalThis.magnet },
      redraw({ transformer }) {
        const magnets = transformer.getSharedVar("result");
        renderMagnet(magnets);
      },
    }
  );

  const commonInsertFlows = [
    {
      find: "SelectionService",
      flow: [
        {
          comp: "MagnetPositionService",
          name: "MagnetPositionService",
          sharedVar: {
            magnets: globalThis.magnet,
          },
          evaluate({ magnets, offsetx, offsety, result }) {
            if (result && result.length) {
              const datum = d3.select(result[0]).datum();
              datum.x = offsetx - 25;
              datum.y = offsety - 25;
            } else if (offsetx && offsety) {
              magnets.push({
                x: offsetx - 25,
                y: offsety - 25,
                property:
                  globalThis.properties[
                    magnets.length % globalThis.properties.length
                  ],
              });
            }
            return magnets;
          },
        },
        magnetTransformer,
      ],
    },
    {
      find: "MagnetPositionService",
      flow: [
        {
          comp: "DustLayoutService",
          name: "DustLayoutService",
          sharedVar: { result: globalThis.magnet, dusts: globalThis.data },
          evaluate({ result: magnets, dusts, self }) {
            cancelAnimationFrame(globalThis.tickUpdate);

            const copyDusts = JSON.parse(JSON.stringify(dusts));

            for (const magnet of magnets) {
              const extent = d3.extent(
                copyDusts.map((datum) => datum[magnet.property])
              );
              for (const dust of copyDusts) {
                let x = dust.x;
                let y = dust.y;
                let dx = magnet.x;
                let dy = magnet.y;
                x += ((dx - x) * dust[magnet.property]) / 100 / extent[1];
                y += ((dy - y) * dust[magnet.property]) / 100 / extent[1];

                dust.x = x;
                dust.y = y;
              }
            }

            globalThis.tickUpdate = requestAnimationFrame(() =>
              self.setSharedVar("dusts", copyDusts)
            );
            return copyDusts;
          },
        },
        dustTransformer,
      ],
    },
  ];

  Libra.Interaction.build({
    inherit: "DragInstrument",
    layers: [
      { layer: magnetLayer, options: { pointerEvents: "visiblePainted" } }, // Block the underlying layer events
    ],
    remove: [
      {
        find: "SelectionTransformer", // Don't render the selected mark
      },
    ],
    insert: commonInsertFlows,
  });

  Libra.Interaction.build({
    inherit: "ClickInstrument",
    layers: [bgLayer],
    insert: commonInsertFlows,
  });

  Libra.Interaction.build({
    inherit: "HoverInstrument",
    layers: [dustLayer],
    sharedVar: {
      highlightColor: "greenyellow",
    },
  });
}

main();
