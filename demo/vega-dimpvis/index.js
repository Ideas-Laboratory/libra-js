// import static visualization and global variables
const VIS = require("./staticVisualization");

async function main() {
  await VIS.loadData();
  await VIS.renderStaticVisualization();
  const mainLayer = renderMainVisualization();
  mountInteraction(mainLayer);
}

function renderMainVisualization() {
  // Create the main layer
  const mainLayer = Libra.Layer.initialize("VegaLayer", {
    name: "mainLayer",
    group: "point",
    container: document.querySelector("#LibraPlayground svg"),
  });

  return mainLayer;
}

function mountInteraction(layer) {
  // Register TraceTransformer
  Libra.GraphicalTransformer.register("TraceTransformer", {
    redraw: function ({ layer }) {
      const data = this.getSharedVar("result");
      if (data) {
        // Draw the trace
        const transientLayer = layer.getLayerFromQueue("transientLayer");
        d3.select(transientLayer.getGraphic()).selectAll("*").remove();
        d3.select(transientLayer.getGraphic())
          .append("g")
          .attr("class", "trace")
          .attr(
            "transform",
            `translate(${layer._offset.x}, ${layer._offset.y})`
          )
          .call((g) => {
            g.append("path")
              .attr(
                "d",
                d3.line(
                  (d) => globalThis.x(d.fertility),
                  (d) => globalThis.y(d.life_expect)
                )(data)
              )
              .attr("fill", "none")
              .attr("stroke", "#bbb")
              .attr("stroke-width", 3)
              .attr("stroke-opacity", 0.5);
          })
          .call((g) => {
            g.selectAll("text")
              .data(data)
              .enter()
              .append("text")
              .attr("fill", "#555")
              .attr("fill-opacity", 0.6)
              .attr("font-size", 12)
              .attr("x", (d) => globalThis.x(d.fertility))
              .attr("y", (d) => globalThis.y(d.life_expect))
              .text((d) => d.year);
          });
      }
    },
  });

  Libra.GraphicalTransformer.register("MainTransformer", {
    async redraw({ transformer }) {
      const result = transformer.getSharedVar("result");
      if (result) {
        globalThis.interpolatedData = result;
        globalThis.vegaView.data("interpolatedData", result);
        globalThis.vegaView.data("year", result[0].year);
        await globalThis.vegaView.runAsync(); // Wait for rendering to avoid memory
      }
    },
  });

  const useTraceTransformerFlow = {
    find: "SelectionService",
    flow: [
      {
        comp: "FilterService",
        sharedVar: {
          data: globalThis.data,
          fields: ["country"],
        },
      },
      {
        comp: "TraceTransformer",
      },
    ],
  };

  const useCountryFlow = {
    find: "SelectionService",
    flow: [
      {
        comp: "TextTransformer",
        layer: layer.getLayerFromQueue("countryLayer"),
        sharedVar: {
          field: "country",
          position: (d) =>
            globalThis.interpolatedData
              .filter((dd) => dd.country == d.country)
              .map((d) => ({
                x: globalThis.x(d.fertility),
                y: globalThis.y(d.life_expect),
              }))[0],
        },
      },
    ],
  };

  Libra.Interaction.build({
    inherit: "HoverInstrument",
    layers: [layer],
    remove: [{ find: "SelectionTransformer" }],
    insert: [useTraceTransformerFlow, useCountryFlow],
  }).on(
    "click",
    Libra.Command.initialize("RecordInterpolatedYear", {
      async execute() {},
    })
  );

  Libra.Interaction.build({
    inherit: "DragInstrument",
    layers: [layer],
    remove: [{ find: "SelectionTransformer" }],
    insert: [
      useTraceTransformerFlow,
      useCountryFlow,
      {
        find: "SelectionService",
        flow: [
          {
            comp: "NearestPointService",
            sharedVar: { layer: layer.getLayerFromQueue("transientLayer") },
            evaluate(options) {
              const { layer, offsetx, offsety } = options;
              const point = [offsetx, offsety];
              if (layer && offsetx && offsety) {
                const year = d3
                  .select(layer.getGraphic())
                  .select(".trace")
                  .selectAll("text")
                  .data();
                const trace = d3
                  .select(layer.getGraphic())
                  .select("path")
                  .attr("d");
                const poly = trace
                  .slice(1)
                  .split("L")
                  .map((pStr) => pStr.split(",").map((num) => parseFloat(num)));
                return {
                  data: year,
                  interpolatedNum: VIS.interpolateNNPointFromPoly(
                    [point[0] - layer._offset.x, point[1] - layer._offset.y],
                    poly
                  ),
                };
              }
              return null;
            },
          },
          {
            comp: "InterpolationService",
            sharedVar: {
              data: globalThis.data,
              field: "year",
              formula: {
                year: (d) => Math.floor(d.year / 5) * 5, // Year divisible by 5
              },
            },
          },
          {
            comp: "MainTransformer",
          },
        ],
      },
    ],
  });
}

main();
