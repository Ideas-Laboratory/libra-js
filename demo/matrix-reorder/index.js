// import static visualization and global variables
const VIS = require("./staticVisualization");

async function main() {
  await VIS.loadData();
  VIS.renderStaticVisualization();
  const mainLayer = renderMainVisualization();
  mountInteraction(mainLayer);
}

function renderMainVisualization(
  names = globalThis.names,
  x = globalThis.x,
  y = globalThis.y
) {
  // Find the SVG element on page
  const svg = d3.select("#LibraPlayground svg");

  let g = svg.select(".main");
  let returnVal = null;
  if (g.empty()) {
    // Create the main layer
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

  // Draw matrix cells
  g.selectAll(".cell")
    .data(globalThis.matrixData)
    .join("rect")
    .attr("class", "cell")
    .attr("x", (d) => x(d.col))
    .attr("y", (d) => y(d.row))
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .attr("fill", (d) => globalThis.color(d.value));

  // Add row labels
  g.selectAll(".row-label")
    .data(names)
    .join("text")
    .attr("class", "row-label")
    .attr("x", -5)
    .attr("y", (d) => y(d) + y.bandwidth() / 2)
    .attr("text-anchor", "end")
    .attr("alignment-baseline", "middle")
    .text((d) => d);

  // Add column labels
  g.selectAll(".col-label")
    .data(names)
    .join("text")
    .attr("class", "col-label")
    .attr("x", (d) => x(d) + x.bandwidth() / 2)
    .attr("y", -5)
    .attr("text-anchor", "start")
    .attr("alignment-baseline", "baseline")
    .attr("transform", (d) => `rotate(-90, ${x(d) + x.bandwidth() / 2}, -5)`)
    .text((d) => d);

  return returnVal;
}

function reorderMatrix(names, scaleX, scaleY, startColumn, targetColumn) {
  // Swap the position of startColumn and targetColumn
  const reorderedNames = names.map((name) => {
    if (name === startColumn) {
      return targetColumn;
    }
    if (name === targetColumn) {
      return startColumn;
    }
    return name;
  });

  const x = scaleX.copy();
  const y = scaleY.copy();
  x.domain(reorderedNames);
  y.domain(reorderedNames);

  return { reorderedNames, x, y };
}

function mountInteraction(layer) {
  Libra.Service.register("ReorderService", {
    sharedVar: {
      names: globalThis.names,
      scaleX: globalThis.x,
      scaleY: globalThis.y,
    },
   evaluate({ names, scaleX, scaleY, startx, offsetx, currentx, self }) {
      if (offsetx) {
        const offset = offsetx - currentx;
        const startColumn = globalThis.x
          .domain()
          .find(
            (name) =>
              globalThis.x(name) <= startx + offset - globalThis.MARGIN.left &&
              startx + offset - globalThis.MARGIN.left <=
                globalThis.x(name) + globalThis.x.bandwidth()
          );
        const targetColumn = globalThis.x
          .domain()
          .find(
            (name) =>
              globalThis.x(name) <= offsetx - globalThis.MARGIN.left &&
              offsetx - globalThis.MARGIN.left <=
                globalThis.x(name) + globalThis.x.bandwidth()
          );
        if (startColumn && targetColumn) {
          return reorderMatrix(
            names,
            scaleX,
            scaleY,
            startColumn,
            targetColumn
          );
        }
      } else {
        // Persist the result
        const results = self.oldCachedResults;
        if (results) {
          names.forEach((_, i) => {
            names[i] = results.reorderedNames[i];
          });
          scaleX.domain(names);
          scaleY.domain(names);
        }
      }
      return {
        reorderedNames: names,
        x: scaleX,
        y: scaleY,
      };
    },
  });

  const transformer = Libra.GraphicalTransformer.initialize(
    "MatrixTransformer",
    {
      layer,
      redraw({ transformer }) {
        const result = transformer.getSharedVar("result");
        if (result) {
          const { reorderedNames, x, y } = result;
          if (reorderedNames) {
            renderMainVisualization(reorderedNames, x, y);
          }
        }
      },
    }
  );

  // Reordering interaction
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
