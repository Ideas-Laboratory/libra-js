// global constants
globalThis.MARGIN = { top: 10, right: 10, bottom: 50, left: 50 };
globalThis.WIDTH = 800 - globalThis.MARGIN.left - globalThis.MARGIN.right;
globalThis.HEIGHT = 800 - globalThis.MARGIN.top - globalThis.MARGIN.bottom;
globalThis.TICK_COUNT = 5;
globalThis.COLOR_FIELD = "class";

// global variables
globalThis.data = [];
globalThis.fields = [];

// shared scales
globalThis.x = null;
globalThis.y = null;

async function loadData() {
  globalThis.data = await d3.csv("./data/bezdekIris.csv");
  globalThis.fields = [
    "sepal_length",
    "sepal_width",
    "petal_length",
    "petal_width",
  ];

  globalThis.data = globalThis.data.map((datum) => ({
    ...datum,
    ...Object.fromEntries(
      globalThis.fields.map((field) => [field, parseFloat(datum[field])])
    ),
  }));
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
    .attr(
      "viewbox",
      `0 0 ${
        globalThis.WIDTH + globalThis.MARGIN.left + globalThis.MARGIN.right
      } ${globalThis.HEIGHT + globalThis.MARGIN.top + globalThis.MARGIN.bottom}`
    )
    .append("g")
    .attr(
      "transform",
      "translate(" + globalThis.MARGIN.left + "," + globalThis.MARGIN.top + ")"
    );

  // Add X axis
  globalThis.x = globalThis.fields.map((field, i) =>
    d3
      .scaleLinear()
      .domain(d3.extent(globalThis.data.map((d) => d[field])))
      .range([
        0,
        globalThis.WIDTH / globalThis.fields.length -
          globalThis.MARGIN.left -
          globalThis.MARGIN.right,
      ])
      .nice(globalThis.TICK_COUNT)
      .clamp(true)
  );

  // Add Y axis
  globalThis.y = globalThis.fields.map((field, i) =>
    d3
      .scaleLinear()
      .domain(d3.extent(globalThis.data.map((d) => d[field])))
      .range([
        globalThis.HEIGHT / globalThis.fields.length -
          globalThis.MARGIN.top -
          globalThis.MARGIN.bottom,
        0,
      ])
      .nice(globalThis.TICK_COUNT)
      .clamp(true)
  );

  // Add color scale
  const colorExtent = d3.extent(
    globalThis.data.map((d) => d[globalThis.COLOR_FIELD])
  );
  globalThis.color = d3
    .scaleOrdinal()
    .domain(colorExtent)
    .range(d3.schemeTableau10);

  // Draw SPLOM axis
  globalThis.x.forEach((scaleX, x) => {
    globalThis.y.forEach((scaleY, y) => {
      const cellOffsetX = (x * globalThis.WIDTH) / globalThis.fields.length;
      const cellOffsetY = (y * globalThis.HEIGHT) / globalThis.fields.length;
      svg
        .append("g")
        .attr("transform", `translate(${cellOffsetX},${cellOffsetY})`)
        .call((g) =>
          g
            .append("g")
            .attr(
              "transform",
              `translate(${globalThis.MARGIN.left},${
                globalThis.HEIGHT / globalThis.fields.length -
                globalThis.MARGIN.bottom
              })`
            )
            .call(d3.axisBottom(scaleX).ticks(globalThis.TICK_COUNT))
            .call((g) =>
              g
                .selectAll(".tick line")
                .clone()
                .attr("stroke-opacity", 0.1)
                .attr(
                  "y2",
                  -(
                    globalThis.HEIGHT / globalThis.fields.length -
                    globalThis.MARGIN.bottom -
                    globalThis.MARGIN.top
                  )
                )
            )
            .call((g) =>
              g
                .append("text")
                .text(globalThis.fields[x])
                .attr("fill", "black")
                .attr("text-anchor", "end")
                .attr("font-size", "12px")
                .attr("font-weight", "bold")
                .attr("x", globalThis.WIDTH / globalThis.fields.length / 2)
                .attr("y", 32)
            )
        )
        .call((g) =>
          g
            .append("g")
            .attr(
              "transform",
              `translate(${globalThis.MARGIN.left},${globalThis.MARGIN.top})`
            )
            .call(d3.axisLeft(scaleY).ticks(globalThis.TICK_COUNT))
            .call((g) =>
              g
                .selectAll(".tick line")
                .clone()
                .attr("stroke-opacity", 0.1)
                .attr(
                  "x2",
                  globalThis.WIDTH / globalThis.fields.length -
                    globalThis.MARGIN.left -
                    globalThis.MARGIN.right
                )
            )
            .call((g) =>
              g
                .append("g")
                .attr(
                  "transform",
                  `translate(${-globalThis.MARGIN.left / 2 - 10}, ${
                    (globalThis.HEIGHT / globalThis.fields.length -
                      globalThis.MARGIN.top -
                      globalThis.MARGIN.bottom) /
                    2
                  })`
                )
                .append("text")
                .text(globalThis.fields[y])
                .attr("fill", "black")
                .attr("text-anchor", "middle")
                .attr("font-size", "12px")
                .attr("font-weight", "bold")
                .style("writing-mode", "tb")
                .attr("transform", "rotate(180)")
            )
        );
    });
  });
}

module.exports = {
  loadData,
  renderStaticVisualization,
};
