// global constants
globalThis.MARGIN = { top: 20, right: 20, bottom: 50, left: 50 };
globalThis.WIDTH = 500 - globalThis.MARGIN.left - globalThis.MARGIN.right;
globalThis.HEIGHT = 380 - globalThis.MARGIN.top - globalThis.MARGIN.bottom;
globalThis.IBMURL = "./data/stocks/IBM.csv";
globalThis.GOOGURL = "./data/stocks/GOOG.csv";
globalThis.MSFTURL = "./data/stocks/MSFT.csv";
globalThis.AAPLURL = "./data/stocks/AAPL.csv";
globalThis.AMZNURL = "./data/stocks/AMZN.csv";
globalThis.STOCKSURL = "./data/stocks/stocks.csv";

// global variables
globalThis.data = [];

// shared scales
globalThis.x = null;
globalThis.y = null;
globalThis.color = null;

async function loadData() {
  const data = await d3.csv(globalThis.STOCKSURL, (d) => ({
    name: d.symbol,
    date: new Date(d.date),
    value: +d.price,
  }));

  globalThis.data = d3.groups(data, (d) => d.name);

  const date = data[0].date;

  globalThis.data.forEach(([_, items]) => {
    if (items.length > 0) {
      let leftItemIndex = 0;
      let rightItemIndex = 0;
      for (let i = 1; i < items.length; ++i) {
        const item = items[i];
        if (date <= item.date) {
          leftItemIndex = i - 1;
          rightItemIndex = i;
          break;
        }
      }
      const leftItem = items[leftItemIndex];
      const rightItem = items[rightItemIndex];
      const a =
        leftItem.date === rightItem.date
          ? 1
          : (date - leftItem.date) / (rightItem.date - leftItem.date);
      let baseValue = leftItem.value * a + rightItem.value * (1 - a);
      items.forEach(({ value }, i) => {
        items[i].k = value / baseValue;
      });
    }
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
  globalThis.x = d3
    .scaleUtc()
    .domain(
      d3.extent(
        globalThis.data.flatMap((d) => d[1]),
        (d) => d.date
      )
    )
    .range([0, globalThis.WIDTH]);
  svg
    .append("g")
    .attr("transform", "translate(0," + globalThis.HEIGHT + ")")
    .call(d3.axisBottom(globalThis.x).tickSizeOuter(0))
    .call((g) =>
      g
        .selectAll(".tick line")
        .clone()
        .attr("stroke-opacity", 0.1)
        .attr("y2", -globalThis.HEIGHT)
    );

  // Add Y axis
  globalThis.y = d3
    .scaleLinear()
    .domain(
      d3.extent(
        globalThis.data.flatMap((d) => d[1]),
        (d) => d.k
      )
    )
    .range([globalThis.HEIGHT, 0]);

  // Add color scale
  globalThis.color = d3
    .scaleOrdinal(d3.schemeCategory10)
    .domain(globalThis.data.map((d) => d.name));
}

module.exports = {
  loadData,
  renderStaticVisualization,
};
