// Constants
const MARGIN = { top: 30, right: 80, bottom: 40, left: 60 };
const WIDTH = 500 - MARGIN.left - MARGIN.right;
const HEIGHT = 400 - MARGIN.top - MARGIN.bottom;
const FIELD_X = "x";
const FIELD_Y = "y";
const FIELD_COLOR = "label";

// Global variables
let data = [];
let centroids = [];

async function createViz() {
  // Load data
  data = await d3.json("./data/mnist_tsne.json");
  
  // Initialize centroids
  centroids = Array(10).fill(0).map((_, i) => ({
    cluster: i,
    ...data.find(d => d[FIELD_COLOR] === i)
  }));

  // Setup visualization
  const svg = d3.select("#LibraPlayground")
    .append("svg")
    .attr("width", WIDTH + MARGIN.left + MARGIN.right)
    .attr("height", HEIGHT + MARGIN.top + MARGIN.bottom);

  // Add instruction text
  d3.select("#LibraPlayground")
    .append("p")
    .style("color", "red")
    .style("font-weight", "700")
    .text("Drag to move the centroid, right-click to generate new hull result");

  // Create main group
  const g = svg.append("g")
    .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

  // Setup scales
  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => d[FIELD_X])])
    .range([0, WIDTH])
    .nice()
    .clamp(true);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d[FIELD_Y])])
    .range([0, HEIGHT])
    .nice()
    .clamp(true);

  const color = d3.scaleOrdinal()
    .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    .range(d3.schemeTableau10);

  // Add legend
  const legend = svg.append("g")
    .attr("transform", `translate(${WIDTH + MARGIN.left + 10}, ${MARGIN.top})`);

  legend.append("text")
    .text(FIELD_COLOR)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("x", MARGIN.right / 2)
    .attr("y", -MARGIN.top / 2);

  legend.selectAll(".legend-item")
    .data(d3.range(10))
    .join("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => `translate(0, ${i * 20})`)
    .call(g => {
      g.append("circle")
        .attr("fill", d => color(d))
        .attr("r", 5);
      g.append("text")
        .text(d => d)
        .attr("x", 10)
        .attr("y", 5)
        .attr("font-size", "12px");
    });

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

  // Draw background points
  const pointsLayer = g.append("g")
    .attr("class", "points")
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => x(d[FIELD_X]))
    .attr("cy", d => y(d[FIELD_Y]))
    .attr("r", 3)
    .attr("fill", d => color(d[FIELD_COLOR]))
    .attr("fill-opacity", 0.7)
    .attr("stroke", "none")  // Initially no stroke
    .attr("stroke-opacity", 0.3)
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

  // Create hull layer
  const hullLayer = g.append("g").attr("class", "hull-layer");
  
  // Create centroids layer
  const centroidLayer = g.append("g").attr("class", "centroid-layer");

  function updateClusters(iterations = 1, updateHulls = false) {
    // Perform k-means clustering
    const kmeansResult = kmeans(
      data.map(d => [d[FIELD_X], d[FIELD_Y]]),
      10,
      {
        initialization: centroids.map(c => [c[FIELD_X], c[FIELD_Y]]),
        maxIterations: iterations
      }
    );

    // Update data clusters
    data.forEach((d, i) => {
      d.cluster = kmeansResult.clusters[i];
    });

    // Update centroids if more than 1 iteration
    if (iterations > 1) {
      kmeansResult.centroids.forEach((c, i) => {
        centroids[i][FIELD_X] = c.centroid[0];
        centroids[i][FIELD_Y] = c.centroid[1];
      });
      updateCentroids();
    }

    // Update point strokes to show clusters
    g.selectAll(".points circle")
      .data(data)
      .attr("stroke", d => color(d.cluster));

    // Update hulls only when requested (right-click)
    if (updateHulls) {
      const groupedData = d3.group(data, d => d.cluster);
      const hulls = Array(10).fill(0).map((_, i) => {
        const group = groupedData.get(i) || [];
        return d3.polygonHull(group.map(d => [x(d[FIELD_X]), y(d[FIELD_Y])]));
      });

      hullLayer.selectAll("path")
        .data(hulls)
        .join("path")
        .attr("d", d => d ? `M${d.join("L")}Z` : "")
        .attr("fill", "none")
        .attr("stroke", (_, i) => color(i))
        .attr("stroke-width", 2);
    }
  }

  // Draw and update centroids
  function updateCentroids() {
    const drag = d3.drag()
      .on("start", function(event, d) {
        // Store initial offset
        d.offsetX = x(d[FIELD_X]) - event.x;
        d.offsetY = y(d[FIELD_Y]) - event.y;
      })
      .on("drag", function(event, d) {
        // Apply offset to get correct position
        const newX = x.invert(event.x + d.offsetX);
        const newY = y.invert(event.y + d.offsetY);
        d[FIELD_X] = newX;
        d[FIELD_Y] = newY;
        updateCentroids();
        updateClusters();
      });

    centroidLayer.selectAll("rect")
      .data(centroids)
      .join("rect")
      .attr("width", 20)
      .attr("height", 20)
      .attr("rx", 5)
      .attr("x", d => x(d[FIELD_X]) - 10)
      .attr("y", d => y(d[FIELD_Y]) - 10)
      .attr("fill", d => color(d.cluster))
      .attr("stroke", "black")
      .call(drag);
  }

  // Update right-click handler
  svg.on("contextmenu", function(event) {
    event.preventDefault(); // Prevent default context menu
    updateClusters(10, true); // Run k-means with more iterations and update hulls
  });

  // Initial render
  updateCentroids();
  updateClusters(1, true); // Show initial hulls
}

createViz(); 