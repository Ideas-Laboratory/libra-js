const VIS = require("./staticVisualization");

async function main() {
  await VIS.loadData();
  VIS.renderStaticVisualization();
  const mainLayer = renderMainVisualization();
  mountInteraction(mainLayer);
}

function renderMainVisualization(
  dimensions = globalThis.dimensions,
  x = globalThis.x,
  y = globalThis.y
) {
  const svg = d3.select("#LibraPlayground svg");

  let g = svg.select(".main");
  let returnVal = null;
  if (g.empty()) {
    const mainLayer = Libra.Layer.initialize("D3Layer", {
      name: "mainLayer",
      width: globalThis.WIDTH,
      height: globalThis.HEIGHT,
      offset: { x: globalThis.MARGIN.left, y: globalThis.MARGIN.top },
      container: svg.node(),
    });
    g = d3.select(mainLayer.getGraphic());
    g.attr("class", "main");

    returnVal = mainLayer;
  }

  // Draw axes
  g.selectAll(".axis")
    .data(dimensions)
    .join("g")
    .attr("class", "axis")
    .attr("transform", (d) => `translate(${x(d)},0)`)
    .each(function (d) {
      d3.select(this).call(d3.axisLeft(y[d]));
    });

  // Draw lines
  const line = d3
    .line()
    .defined((d) => !isNaN(d[1]))
    .x((d, i) => x(dimensions[i]))
    .y((d) => d[1]);

  g.selectAll(".line")
    .data(globalThis.parallelData)
    .join("path")
    .attr("class", "line")
    .attr("d", (d) => line(dimensions.map((p) => [p, y[p](d[p])])))
    .style("fill", "none")
    .style("stroke", "steelblue")
    .style("opacity", 0.5);

  return returnVal;
}

function reorderAxes(dimensions, scaleX, startAxis, targetAxis) {
  const reorderedDimensions = dimensions.slice();
  const startIndex = dimensions.indexOf(startAxis);
  const targetIndex = dimensions.indexOf(targetAxis);
  reorderedDimensions.splice(startIndex, 1);
  reorderedDimensions.splice(targetIndex, 0, startAxis);

  const x = scaleX.copy().domain(reorderedDimensions);

  return { reorderedDimensions, x };
}

function mountInteraction(layer) {
  Libra.Service.register("ReorderService", {
    sharedVar: {
      dimensions: globalThis.dimensions,
      scaleX: globalThis.x,
    },
    evaluate({ dimensions, scaleX, startx, offsetx, currentx, self }) {
      if (offsetx) {
        const offset = offsetx - currentx;
        const startAxis = globalThis.dimensions.find(
          (dim) =>
            Math.abs(
              globalThis.x(dim) - (startx + offset - globalThis.MARGIN.left)
            ) <
            globalThis.x.step() / 2
        );
        const targetAxis = globalThis.dimensions.find(
          (dim) =>
            Math.abs(globalThis.x(dim) - (offsetx - globalThis.MARGIN.left)) <
            globalThis.x.step() / 2
        );
        if (startAxis && targetAxis) {
          return reorderAxes(dimensions, scaleX, startAxis, targetAxis);
        }
      } else {
        const results = self.oldCachedResults;
        if (results) {
          dimensions.splice(
            0,
            dimensions.length,
            ...results.reorderedDimensions
          );
          scaleX.domain(dimensions);
        }
      }
      return {
        reorderedDimensions: dimensions,
        x: scaleX,
      };
    },
  });

  const transformer = Libra.GraphicalTransformer.initialize(
    "ParallelCoordinatesTransformer",
    {
      layer,
      redraw({ transformer }) {
        const result = transformer.getSharedVar("result");
        if (result) {
          const { reorderedDimensions, x } = result;
          if (reorderedDimensions) {
            renderMainVisualization(reorderedDimensions, x);
          }
        }
      },
    }
  );

  Libra.Interaction.build({
    inherit: "DragInstrument",
    layers: [layer],
    insert: [
      {
        find: "SelectionService",
        flow: [
          {
            comp: "ReorderService",
          },
          transformer,
        ],
      },
    ],
  });
}

main();
