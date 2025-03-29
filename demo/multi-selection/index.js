async function main() {
  await createVisualization();
  mountInteraction();
}

async function createVisualization() {
  // set the dimensions and margins of the graph
  const margin = { top: 10, right: 30, bottom: 30, left: 60 },
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = d3
    .select("#LibraPlayground")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //Read the data
  const sumstat = await d3.json("./data/one_cat.json");
  const data = sumstat.flatMap((x) => x.values);

  // Add X axis --> it is a date format
  const x = d3
    .scaleLinear()
    .domain(
      d3.extent(data, function (d) {
        return d.year;
      })
    )
    .range([0, width]);
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(5));

  // Add Y axis
  const y = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(data, function (d) {
        return +d.n;
      }),
    ])
    .range([height, 0]);
  svg.append("g").call(d3.axisLeft(y));

  // color palette
  const res = sumstat.map(function (d) {
    return d.key;
  }); // list of group names
  const color = d3
    .scaleOrdinal()
    .domain(res)
    .range([
      "#e41a1c",
      "#377eb8",
      "#4daf4a",
      "#984ea3",
      "#ff7f00",
      "#ffff33",
      "#a65628",
      "#f781bf",
      "#999999",
    ]);

  // Draw the line
  svg
    .selectAll(".line")
    .data(sumstat)
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", function (d) {
      return color(d.key);
    })
    .attr("stroke-width", 1.5)
    .attr("d", function (d) {
      return d3
        .line()
        .x(function (d) {
          return x(d.year);
        })
        .y(function (d) {
          return y(+d.n);
        })(d.values);
    });

  d3.select("#LibraPlayground")
    .append("p")
    .text("Current Mode: ")
    .attr("style", "margin: 10px;")
    .append("span")
    .attr("id", "console")
    .text("Create Brush");

  const boxBtn = d3
    .select("#LibraPlayground")
    .append("button")
    .text("Create Brush")
    .attr("style", "margin: 10px;");
  const angBtn = d3
    .select("#LibraPlayground")
    .append("button")
    .text("Create Angular")
    .attr("style", "margin: 10px;");
  const delBtn = d3
    .select("#LibraPlayground")
    .append("button")
    .text("Delete")
    .attr("style", "margin: 10px;");

  return [boxBtn, angBtn, delBtn];
}

function mountInteraction() {}

main();
