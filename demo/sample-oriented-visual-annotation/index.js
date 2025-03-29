main();

/**
 * the interaction part and rendering part are totally seperated.
 * the rendring function share only the basic parts, not a update function directly.
 */
async function main() {
  const groupField = "Origin";
  const valueField = "Horsepower";

  const width = 600;
  const height = 400;
  const svg = d3
    .select("#LibraPlayground")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  const data = await d3.json("./data/cars.json");

  const layer = renderBarChart(
    svg,
    width,
    height,
    data,
    groupField,
    valueField
  );
}

function renderBarChart(root, width, height, data, groupField, valueField) {
  const margin = { top: 20, left: 50, bottom: 50, right: 20 };
  innerWidth = width - margin.left - margin.right;
  innerHeight = height - margin.top - margin.bottom;

  const groupedData = d3.group(data, (d) => d[groupField]);
  const errorBars = [];
  for (const key of groupedData.keys()) {
    const dataEachGroup = groupedData.get(key);
    const mean = computeMean(dataEachGroup, valueField);
    const [min, max] = computeConfidenceInterval(
      dataEachGroup,
      valueField,
      mean
    );
    errorBars.push({
      [groupField]: key,
      mean: mean,
      min: min,
      max: max,
    });
  }
  

  const scaleX = d3
    .scaleBand()
    .domain(groupedData.keys())
    .range([0, innerWidth])
    .padding(0.4);
  const scaleY = d3
    .scaleLinear()
    .domain([0, d3.max(Object.entries(errorBars), (d) => d[1]["max"])])
    .range([innerHeight, 0])
    .nice();

  const xAxis = d3.axisBottom(scaleX);
  const yAxis = d3.axisLeft(scaleY);

  const groupX = root
    .append("g")
    .attr("class", "xAxis")
    .attr(
      "transform",
      `translate(${margin.left}, ${margin.top + innerHeight})`
    );
  const groupY = root
    .append("g")
    .attr("class", "yAxis")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
  const groupMain = root
    .append("g")
    .attr("class", "main")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  groupX.call(xAxis);
  groupY.call(yAxis);

  const mainLayer = Libra.Layer.initialize(
    "D3Layer",
    innerWidth,
    innerHeight,
    groupMain
  );
  d3.select(mainLayer.getGraphic())
    .selectAll(".bar")
    .data(errorBars)
    .join("rect")
    .attr("class", "bar")
    .attr("fill", "211,211,211")
    .attr("x", (d) => scaleX(d[groupField]))
    .attr("y", d => scaleY(d["mean"]))
    .attr("width", scaleX.bandwidth())
    .attr("height", (d) => scaleY(0) - scaleY(d["mean"]));

  return mainLayer;
}

function computeMean(data, field) {
  return d3.mean(data, (d) => d[field]);
}

function computeStandardError(data, field, mean) {
  mean = mean ? mean : computeMean(data, field);
  return Math.sqrt(
    data
      .map((d) => Math.pow(d[field] - mean, 2))
      .reduce((acc, val) => acc + val) /
      (data.length - 1)
  );
}

function computeConfidenceInterval(data, field, mean) {
  const z = 1.96; // 95% confidendce level
  mean = mean ? mean : d3.mean(data, field);
  const standardError = computeStandardError(data, field, mean);
  return [mean - z * standardError, mean + z * standardError];
}
