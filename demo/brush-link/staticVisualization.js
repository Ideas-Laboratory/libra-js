// global constants
globalThis.MARGIN = { top: 0, right: 0, bottom: 0, left: 0 };
globalThis.WIDTH = 950 - globalThis.MARGIN.left - globalThis.MARGIN.right;
globalThis.HEIGHT = 500 - globalThis.MARGIN.top - globalThis.MARGIN.bottom;
globalThis.HIST_MARGIN = { top: 10, right: 10, bottom: 40, left: 50 };
globalThis.HIST_WIDTH =
  globalThis.WIDTH / 3 -
  globalThis.HIST_MARGIN.left -
  globalThis.HIST_MARGIN.right;
Object.defineProperty(globalThis, "HIST_HEIGHT", {
  get() {
    return (
      globalThis.HEIGHT / globalThis.histFields.length -
      globalThis.HIST_MARGIN.top -
      globalThis.HIST_MARGIN.bottom
    );
  },
});
globalThis.SCATTER_MARGIN = {
  top: 10,
  right: 100,
  bottom: 40,
  left:
    globalThis.HIST_MARGIN.left +
    globalThis.HIST_MARGIN.right +
    globalThis.HIST_WIDTH +
    50,
};
globalThis.SCATTER_WIDTH =
  globalThis.WIDTH -
  globalThis.SCATTER_MARGIN.left -
  globalThis.SCATTER_MARGIN.right;
globalThis.SCATTER_HEIGHT =
  globalThis.HEIGHT -
  globalThis.SCATTER_MARGIN.top -
  globalThis.SCATTER_MARGIN.bottom;
globalThis.SCATTER_LEGEND_MARGIN = {
  top: globalThis.SCATTER_MARGIN.top + 40,
  right: 20,
  bottom: (globalThis.SCATTER_HEIGHT / 6) * 5,
  left: globalThis.SCATTER_MARGIN.left + globalThis.SCATTER_WIDTH + 20,
};

// global variables
globalThis.data = [];
globalThis.histFields = [];
globalThis.scatterFieldX = "";
globalThis.scatterFieldY = "";
globalThis.scatterFieldColor = "";

// shared scales
globalThis.bin = null;
globalThis.x = null;
globalThis.y = null;
globalThis.color = null;

async function loadData() {
  globalThis.data = await d3.json("./data/cars.json");
  globalThis.histFields = [
    "Cylinders",
    "Displacement",
    "Weight_in_lbs",
    "Acceleration",
  ];
  globalThis.scatterFieldX = "Horsepower";
  globalThis.scatterFieldY = "Miles_per_Gallon";
  globalThis.scatterFieldColor = "Origin";

  globalThis.data = globalThis.data.filter(
    (d) =>
      globalThis.histFields.every((field) => typeof d[field] === "number") &&
      typeof d[globalThis.scatterFieldX] === "number" &&
      typeof d[globalThis.scatterFieldY] === "number"
  );

  globalThis.bin = {};
  globalThis.histFields.forEach((field) => {
    const extent = d3.extent(globalThis.data.map((d) => d[field]));
    globalThis.bin[field] = d3
      .bin()
      .thresholds(10)
      .domain(extent)
      .value((d) => d[field]);
  });
}

function renderStaticVisualization() {
  // append the svg object to the body of the page
  const svg = d3
    .select("#LibraPlayground")
    .append("svg")
    .attr(
      "width",
      globalThis.WIDTH + globalThis.MARGIN.left + globalThis.MARGIN.right
    )
    .attr(
      "height",
      globalThis.HEIGHT + globalThis.MARGIN.top + globalThis.MARGIN.bottom
    )
    .attr("viewbox", `0 0 ${globalThis.WIDTH} ${globalThis.HEIGHT}`)
    .append("g")
    .attr(
      "transform",
      "translate(" + globalThis.MARGIN.left + "," + globalThis.MARGIN.top + ")"
    );

  // create x axes
  globalThis.x = {};
  globalThis.histFields.forEach((field, i) => {
    globalThis.x[field] = d3
      .scaleLinear()
      .domain(d3.extent(globalThis.data.map((d) => d[field])))
      .range([0, globalThis.HIST_WIDTH]);
    svg
      .append("g")
      .attr(
        "transform",
        `translate(${globalThis.HIST_MARGIN.left}, ${
          globalThis.HIST_MARGIN.top +
          globalThis.HIST_HEIGHT +
          (globalThis.HIST_HEIGHT +
            globalThis.HIST_MARGIN.top +
            globalThis.HIST_MARGIN.bottom) *
            i
        })`
      )
      .call(d3.axisBottom(globalThis.x[field]));
    svg
      .append("text")
      .text(field)
      .attr("text-anchor", "middle")
      .attr("x", globalThis.HIST_MARGIN.left + globalThis.HIST_WIDTH / 2)
      .attr(
        "y",
        globalThis.HIST_MARGIN.top +
          globalThis.HIST_HEIGHT +
          globalThis.HIST_MARGIN.bottom +
          (globalThis.HIST_HEIGHT +
            globalThis.HIST_MARGIN.top +
            globalThis.HIST_MARGIN.bottom) *
            i
      );
  });
  globalThis.x[globalThis.scatterFieldX] = d3
    .scaleLinear()
    .domain(d3.extent(globalThis.data.map((d) => d[globalThis.scatterFieldX])))
    .range([0, globalThis.SCATTER_WIDTH])
    .nice();
  svg
    .append("g")
    .attr(
      "transform",
      `translate(${globalThis.SCATTER_MARGIN.left}, ${
        globalThis.SCATTER_MARGIN.top + globalThis.SCATTER_HEIGHT
      })`
    )
    .call(d3.axisBottom(globalThis.x[globalThis.scatterFieldX]));
  svg
    .append("text")
    .text(globalThis.scatterFieldX)
    .attr("text-anchor", "middle")
    .attr("x", globalThis.SCATTER_MARGIN.left + globalThis.SCATTER_WIDTH / 2)
    .attr(
      "y",
      globalThis.SCATTER_MARGIN.top +
        globalThis.SCATTER_HEIGHT +
        globalThis.SCATTER_MARGIN.bottom
    );

  // create y axes
  globalThis.y = {};
  globalThis.histFields.forEach((field, i) => {
    const binnedData = globalThis.bin[field](globalThis.data);
    let maxY = 0;
    binnedData.forEach((d) => {
      if (d.length > maxY) maxY = d.length;
    });
    globalThis.y[field] = d3
      .scaleLinear()
      .domain([0, maxY])
      .range([0, globalThis.HIST_HEIGHT]);
    svg
      .append("g")
      .attr(
        "transform",
        `translate(${globalThis.HIST_MARGIN.left}, ${
          globalThis.HIST_MARGIN.top +
          (globalThis.HIST_HEIGHT +
            globalThis.HIST_MARGIN.top +
            globalThis.HIST_MARGIN.bottom) *
            i
        })`
      )
      .call(d3.axisLeft(globalThis.y[field]).ticks(5));
  });
  globalThis.y[globalThis.scatterFieldY] = d3
    .scaleLinear()
    .domain(d3.extent(globalThis.data.map((d) => d[globalThis.scatterFieldY])))
    .range([globalThis.SCATTER_HEIGHT, 0])
    .nice();
  svg
    .append("g")
    .attr(
      "transform",
      `translate(${globalThis.SCATTER_MARGIN.left}, ${globalThis.SCATTER_MARGIN.top})`
    )
    .call(d3.axisLeft(globalThis.y[globalThis.scatterFieldY]));
  svg
    .append("text")
    .text(globalThis.scatterFieldY)
    .attr(
      "transform",
      `rotate(-90, ${globalThis.SCATTER_MARGIN.left - 30},${
        globalThis.SCATTER_MARGIN.top + globalThis.SCATTER_HEIGHT / 2
      })`
    )
    .attr("text-anchor", "middle")
    .attr("x", globalThis.SCATTER_MARGIN.left - 30)
    .attr("y", globalThis.SCATTER_MARGIN.top + globalThis.SCATTER_HEIGHT / 2);

  // create color scale and legends
  globalThis.color = d3
    .scaleOrdinal()
    .domain([
      ...new Set(globalThis.data.map((d) => d[globalThis.scatterFieldColor])),
    ])
    .range(d3.schemeTableau10);
  svg
    .append("g")
    .call((g) =>
      g
        .append("text")
        .text(globalThis.scatterFieldColor)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .attr(
          "x",
          globalThis.SCATTER_LEGEND_MARGIN.left +
            globalThis.SCATTER_MARGIN.right / 2
        )
        .attr(
          "y",
          (globalThis.SCATTER_MARGIN.top +
            globalThis.SCATTER_LEGEND_MARGIN.top) /
            2
        )
    )
    .call((g) =>
      g
        .append("g")
        .attr(
          "transform",
          `translate(${globalThis.SCATTER_LEGEND_MARGIN.left},${globalThis.SCATTER_LEGEND_MARGIN.top})`
        )
        .selectAll("g")
        .data(
          new Set(
            globalThis.data.map((d) => d[globalThis.scatterFieldColor])
          ).values()
        )
        .join("g")
        .call((g) => {
          g.append("circle")
            .attr("fill-opacity", "0")
            .attr("stroke-width", 2)
            .attr("stroke", (d) => globalThis.color(d))
            .attr("cx", 10)
            .attr("cy", (_, i) => i * 20)
            .attr("r", 5);
        })
        .call((g) => {
          g.append("text")
            .text((d) => d)
            .attr("font-size", "12px")
            .attr("x", 20)
            .attr("y", (_, i) => i * 20 + 5);
        })
    );
}

module.exports = {
  loadData,
  renderStaticVisualization,
};
