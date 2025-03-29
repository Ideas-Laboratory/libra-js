// Constants
const MARGIN = { top: 30, right: 80, bottom: 40, left: 60 };
const WIDTH = 500 - MARGIN.left - MARGIN.right;
const HEIGHT = 400 - MARGIN.top - MARGIN.bottom;
const FIELD_X = "x";
const FIELD_Y = "y";
const FIELD_COLOR = "label";

async function createViz() {
  // Load data
  const data = await d3.json("./data/mnist_tsne.json");

  // Create SVG
  const svg = d3
    .select("#LibraPlayground")
    .append("svg")
    .attr("width", WIDTH + MARGIN.left + MARGIN.right)
    .attr("height", HEIGHT + MARGIN.top + MARGIN.bottom)
    .attr("viewbox", `0 0 ${WIDTH} ${HEIGHT}`);

  const mainGroup = svg
    .append("g")
    .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

  // Setup scales
  const extentX = [0, d3.max(data, d => d[FIELD_X])];
  const extentY = [0, d3.max(data, d => d[FIELD_Y])];

  const x = d3.scaleLinear()
    .domain(extentX)
    .range([0, WIDTH])
    .nice()
    .clamp(true);

  const y = d3.scaleLinear()
    .domain(extentY)
    .range([0, HEIGHT])
    .nice()
    .clamp(true);

  const color = d3.scaleOrdinal()
    .domain([0, 1, 2, 3, 4, 7, 6, 5, 8, 9])
    .range(d3.schemeTableau10);

  // Add Legend
  const legend = mainGroup.append("g");
  
  legend
    .append("text")
    .text(FIELD_COLOR)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("x", WIDTH + MARGIN.right / 2)
    .attr("y", -MARGIN.top / 2);

  const legendItems = legend
    .selectAll(".legend-item")
    .data(new Array(10).fill(0).map((_, i) => i))
    .join("g")
    .attr("class", "legend-item");

  legendItems
    .append("circle")
    .attr("fill", d => color(d))
    .attr("cx", WIDTH + 10)
    .attr("cy", (_, i) => i * 20)
    .attr("r", 5);

  legendItems
    .append("text")
    .text(d => d)
    .attr("font-size", "12px")
    .attr("x", WIDTH + 20)
    .attr("y", (_, i) => i * 20 + 5);

  // Draw points
  const points = mainGroup
    .selectAll("circle.point")
    .data(data)
    .join("circle")
    .attr("class", "point")
    .attr("cx", d => x(d[FIELD_X]))
    .attr("cy", d => y(d[FIELD_Y]))
    .attr("fill", "lightgray")
    .attr("fill-opacity", 0.7)
    .attr("r", 3);

  // Add click interaction
  let selectedLabel = null;

  points.on("click", function(event, d) {
    if (selectedLabel === d[FIELD_COLOR]) {
      // If clicking on same label, reset all points
      selectedLabel = null;
      points
        .attr("fill", "lightgray")
        .attr("fill-opacity", 0.7);
    } else {
      // Select new label
      selectedLabel = d[FIELD_COLOR];
      points
        .attr("fill", p => p[FIELD_COLOR] === selectedLabel ? color(p[FIELD_COLOR]) : "lightgray")
        .attr("fill-opacity", p => p[FIELD_COLOR] === selectedLabel ? 0.7 : 0.3);
    }
  });
}

createViz();
