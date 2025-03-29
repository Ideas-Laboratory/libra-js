// global constants
globalThis.START_YEAR = 1980;
globalThis.MARGIN = { top: 2.5, right: 168, bottom: 39.5, left: 36 };
globalThis.WIDTH = 800;
globalThis.HEIGHT = 600;

// global variables
globalThis.data = [];
globalThis.year = globalThis.START_YEAR;
globalThis.interpolatedData = [];

// shared scales
globalThis.x = null;
globalThis.y = null;
globalThis.color = null;

async function loadData() {
  //Read the data
  globalThis.data = await d3.json("./data/gapminder.json");
  globalThis.interpolatedData = globalThis.data.filter(
    (x) => x.year === globalThis.year
  );
}

async function renderStaticVisualization() {
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
    .append("g")
    .attr(
      "transform",
      "translate(" + globalThis.MARGIN.left + "," + globalThis.MARGIN.top + ")"
    );

  // Add X axis
  globalThis.x = d3
    .scaleLinear()
    .domain(
      d3.extent(globalThis.data, function (d) {
        return d.fertility;
      })
    )
    .range([0, globalThis.WIDTH])
    .nice();
  svg
    .append("g")
    .attr("transform", "translate(0," + globalThis.HEIGHT + ")")
    .call(d3.axisBottom(globalThis.x).ticks(5))
    .call((g) => {
      g.selectAll("g.tick")
        .append("line")
        .attr("y1", 0)
        .attr("y2", -globalThis.HEIGHT)
        .attr("stroke", "currentColor")
        .attr("stroke-opacity", 0.1);
    })
    .call((g) =>
      g
        .append("text")
        .text("Fertility")
        .attr("font-family", "sans-serif")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .attr("fill", "currentColor")
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${globalThis.WIDTH / 2}, 30)`)
    );

  // Add Y axis
  globalThis.y = d3
    .scaleLinear()
    .domain(
      d3.extent(globalThis.data, function (d) {
        return d.life_expect;
      })
    )
    .range([globalThis.HEIGHT, 0])
    .nice();
  svg
    .append("g")
    .call(d3.axisLeft(globalThis.y).ticks(5))
    .call((g) => {
      g.selectAll("g.tick")
        .append("line")
        .attr("x1", 0)
        .attr("x2", globalThis.WIDTH)
        .attr("stroke", "currentColor")
        .attr("stroke-opacity", 0.1);
    })
    .call((g) =>
      g
        .append("text")
        .text("Life Expectancy")
        .attr("font-family", "sans-serif")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .attr("fill", "currentColor")
        .attr("text-anchor", "middle")
        .attr(
          "transform",
          `translate(-25, ${globalThis.HEIGHT / 2}) rotate(-90)`
        )
    );

  // Color palette
  const clusterDomain = [0, 1, 2, 3, 4, 5];
  globalThis.color = d3
    .scaleOrdinal()
    .domain(clusterDomain)
    .range(['#4c78a8', '#72b7b2', '#eeca3b', '#f58518', '#e45756', '#54a24b']);
  const colorName = d3
    .scaleOrdinal()
    .domain(clusterDomain)
    .range([
      "South Asia",
      "Europe & Central Asia",
      "Sub-saharan Africa",
      "America",
      "East Asia & Pacific",
      "Middle East & North Africa",
    ]);

  // Draw the year
  svg
    .append("g")
    .attr("class", "year")
    .append("text")
    .attr("x", 300)
    .attr("y", 300)
    .attr("font-family", "sans-serif")
    .attr("font-size", 100)
    .attr("fill", "grey")
    .attr("opacity", 0.25)
    .attr("text-align", "center")
    .text(globalThis.year);

  // Draw the legend
  svg
    .append("g")
    .attr("class", "legend")
    .attr(
      "transform",
      `translate(${globalThis.WIDTH + 10}, ${globalThis.MARGIN.top + 10})`
    )
    .call((g) => {
      g.append("text")
        .attr("x", -5)
        .attr("y", 0)
        .attr("font-family", "sans-serif")
        .attr("font-size", 11)
        .attr("font-weight", "bold")
        .attr("alignment-baseline", "middle")
        .text("Region");
    })
    .selectAll("g")
    .data([0, 3, 4, 1, 5, 2])
    .enter()
    .append("g")
    .attr("transform", (d, i) => `translate(0, ${i * 13 + 16})`)
    .call((g) => {
      g.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 5)
        .attr("fill", (d, i) => globalThis.color(d))
        .attr("fill-opacity", 0.5);
    })
    .call((g) => {
      g.append("text")
        .attr("x", 10)
        .attr("y", 0)
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("alignment-baseline", "middle")
        .text((d, i) => colorName(d));
    });
}



function interpolateNNPointFromPoly(point, polyline) {
  // Find the squared distance between two points
  function distanceSquared(p1, p2) {
    let dx = p1[0] - p2[0];
    let dy = p1[1] - p2[1];
    return dx * dx + dy * dy;
  }

  // Find the closest point on a polyline from a given point
  let minDistance = Number.MAX_VALUE;
  let interpolationFactor = 0;
  for (let i = 0; i < polyline.length - 1; i++) {
    let lineStart = polyline[i];
    let lineEnd = polyline[i + 1];
    let lineLengthSquared = distanceSquared(lineStart, lineEnd);
    let u =
      ((point[0] - lineStart[0]) * (lineEnd[0] - lineStart[0]) +
        (point[1] - lineStart[1]) * (lineEnd[1] - lineStart[1])) /
      lineLengthSquared;
    let closest = null;
    if (u < 0) {
      closest = lineStart;
    } else if (u > 1) {
      closest = lineEnd;
    } else {
      closest = [
        lineStart[0] + u * (lineEnd[0] - lineStart[0]),
        lineStart[1] + u * (lineEnd[1] - lineStart[1]),
      ];
    }
    let distance = distanceSquared(point, closest);
    if (distance < minDistance) {
      minDistance = distance;
      if (u < 0) {
        interpolationFactor = i;
      } else if (u > 1) {
        interpolationFactor = i + 1;
      } else {
        interpolationFactor = i + u;
      }
    }
  }
  return interpolationFactor;
}

module.exports = {
  loadData,
  renderStaticVisualization,
  interpolateNNPointFromPoly
};
