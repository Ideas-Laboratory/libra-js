// global constants
const MARGIN = { top: 30, right: 80, bottom: 40, left: 60 };
const WIDTH = 500 - MARGIN.left - MARGIN.right;
const HEIGHT = 400 - MARGIN.top - MARGIN.bottom;
const FIELD_X = "x";
const FIELD_Y = "y";
const FIELD_COLOR = "label";

async function createViz() {
  // Load data
  const data = await d3.json("./data/mnist_tsne.json");

  // Create the SVG container
  const svg = d3
    .select("#LibraPlayground")
    .append("svg")
    .attr("width", WIDTH + MARGIN.left + MARGIN.right)
    .attr("height", HEIGHT + MARGIN.top + MARGIN.bottom)
    .attr("viewbox", `0 0 ${WIDTH} ${HEIGHT}`);

  // Create the main group element
  const g = svg
    .append("g")
    .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

  // Set up scales
  const extentX = [0, d3.max(data, d => d[FIELD_X])];
  const extentY = [0, d3.max(data, d => d[FIELD_Y])];

  const x = d3.scaleLinear()
    .domain(extentX)
    .range([0, WIDTH])
    .nice()
    .clamp(true);

  const y = d3.scaleLinear()
    .domain(extentY)
    .nice()
    .range([0, HEIGHT])
    .clamp(true);

  const color = d3.scaleOrdinal()
    .domain([0, 1, 2, 3, 4, 7, 6, 5, 8, 9])
    .range(d3.schemeTableau10);

  // Add Legend
  const legend = svg.append("g");
  
  legend
    .append("text")
    .text(FIELD_COLOR)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("x", WIDTH + MARGIN.left + MARGIN.right / 2)
    .attr("y", MARGIN.top / 2);

  const legendItems = legend
    .selectAll(".legend-item")
    .data(new Array(10).fill(0).map((_, i) => i))
    .join("g")
    .attr("class", "legend-item");

  legendItems
    .append("circle")
    .attr("fill", d => color(d))
    .attr("cx", WIDTH + MARGIN.left + 10)
    .attr("cy", (_, i) => i * 20 + MARGIN.top)
    .attr("r", 5);

  legendItems
    .append("text")
    .text(d => d)
    .attr("font-size", "12px")
    .attr("x", WIDTH + MARGIN.left + 20)
    .attr("y", (_, i) => i * 20 + MARGIN.top + 5);

  // Create tooltip
  const tooltip = d3.select("#LibraPlayground")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background-color", "white")
    .style("border", "1px solid #ddd")
    .style("padding", "5px")
    .style("pointer-events", "none");

  // Draw points and add interactions
  g.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("class", "mark")
    .attr("cx", d => x(d[FIELD_X]))
    .attr("cy", d => y(d[FIELD_Y]))
    .attr("fill", d => color(d[FIELD_COLOR]))
    .attr("fill-opacity", 0.7)
    .attr("r", 3)
    .on("mouseover", function(event, d) {
      // Highlight the hovered point
      d3.select(this)
        .attr("r", 5)
        .attr("fill-opacity", 1);

      // Show tooltip with MNIST image
      tooltip
        .style("visibility", "visible")
        .html(`<img src="${d.image}" width="140" height="140"/>`);
    })
    .on("mousemove", function(event) {
      tooltip
        .style("top", (event.pageY - 170) + "px")
        .style("left", (event.pageX - 70) + "px");
    })
    .on("mouseout", function() {
      // Reset point appearance
      d3.select(this)
        .attr("r", 3)
        .attr("fill-opacity", 0.7);

      // Hide tooltip
      tooltip.style("visibility", "hidden");
    });
}

createViz();
