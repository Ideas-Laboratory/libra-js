// global constants
globalThis.MARGIN = { top: 30, right: 70, bottom: 40, left: 60 };
globalThis.WIDTH = 500 - globalThis.MARGIN.left - globalThis.MARGIN.right;
globalThis.HEIGHT = 380 - globalThis.MARGIN.top - globalThis.MARGIN.bottom;
globalThis.FIELD_X = "x";
globalThis.FIELD_Y = "y";
globalThis.FIELD_COLOR = "Origin";

// global variables
globalThis.data = [];

// shared scales
globalThis.x = null;
globalThis.y = null;
globalThis.color = null;

const loadName = window.location.search.split('file=')[1].split('&')[0];

async function loadData() {
  globalThis.data = (await d3.json("./data/" + loadName)).filter(
    (d) => !!(d["x"] && d["y"])
  );
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

  const extentX = [0, d3.max(globalThis.data, (d) => d[globalThis.FIELD_X])];
  const extentY = [0, d3.max(globalThis.data, (d) => d[globalThis.FIELD_Y])];

  // Add X axis
  globalThis.x = d3
    .scaleLinear()
    .domain(extentX)
    .range([0, globalThis.WIDTH])
    .nice()
    .clamp(true);
  svg
    .append("g")
    .attr("transform", "translate(0," + globalThis.HEIGHT + ")")
    .call(d3.axisBottom(globalThis.x))
    .append("text")
    .text(globalThis.FIELD_X)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("x", globalThis.WIDTH / 2)
    .attr("y", 30);

  // Add Y axis
  globalThis.y = d3
    .scaleLinear()
    .domain(extentY)
    .nice()
    .range([globalThis.HEIGHT, 0])
    .clamp(true);
  svg
    .append("g")
    .call(d3.axisLeft(globalThis.y))
    .append("text")
    .text(globalThis.FIELD_Y)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("writing-mode", "tb")
    .style(
      "transform",
      `translate(${-globalThis.MARGIN.left / 2}px,${globalThis.HEIGHT / 2
      }px) rotate(180deg)`
    );

  // // Add Legend
  // globalThis.color = d3
  //   .scaleOrdinal()
  //   .domain(
  //     new Set(globalThis.data.map((d) => d[globalThis.FIELD_COLOR])).values()
  //   )
  //   .range(d3.schemeTableau10);
  // svg
  //   .append("g")
  //   .call((g) =>
  //     g
  //       .append("text")
  //       .text(globalThis.FIELD_COLOR)
  //       .attr("fill", "black")
  //       .attr("text-anchor", "middle")
  //       .attr("font-size", "12px")
  //       .attr("font-weight", "bold")
  //       .attr("x", globalThis.WIDTH + globalThis.MARGIN.right / 2)
  //       .attr("y", -globalThis.MARGIN.top / 2)
  //   )
  //   .call((g) =>
  //     g
  //       .append("g")
  //       .selectAll("g")
  //       .data(
  //         new Set(
  //           globalThis.data.map((d) => d[globalThis.FIELD_COLOR])
  //         ).values()
  //       )
  //       .join("g")
  //       .call((g) => {
  //         g.append("circle")
  //           .attr("fill-opacity", "0")
  //           .attr("stroke-width", 2)
  //           .attr("stroke", (d) => globalThis.color(d))
  //           .attr("cx", globalThis.WIDTH + 10)
  //           .attr("cy", (_, i) => i * 20)
  //           .attr("r", 5);
  //       })
  //       .call((g) => {
  //         g.append("text")
  //           .text((d) => d)
  //           .attr("font-size", "12px")
  //           .attr("x", globalThis.WIDTH + 20)
  //           .attr("y", (_, i) => i * 20 + 5);
  //       })
  //   );
}

module.exports = {
  loadData,
  renderStaticVisualization,
};
