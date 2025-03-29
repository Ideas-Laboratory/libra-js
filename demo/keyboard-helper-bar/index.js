registerAxesTransformer();
registerLinesTransformer();
const IBMURL = "./data/stocks/IBM.csv";
const GOOGURL = "./data/stocks/GOOG.csv";
const MSFTURL = "./data/stocks/MSFT.csv";
const AAPLURL = "./data/stocks/AAPL.csv";
const AMZNURL = "./data/stocks/AMZN.csv";
const STOCKSURL = "./data/stocks/stocks.csv";



main();

/**
 * the interaction part and rendering part are totally seperated.
 * the rendring function share only the basic parts, not a update function directly.
 */
async function main() {
  const width = 600;
  const height = 400;
  const svg = d3
    .select("#LibraPlayground")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  
  let data = d3.groups(await loadData2(), (d) => d.name);

  // we need a layer, which we will add interaction for it latter.
  renderIndexChart(svg, width, height, data);
}

function renderIndexChart(root, width, height, data) {
  /* layout information */
  const margin = { top: 20, left: 50, bottom: 50, right: 20 };
  width = width;
  height = height;

  const extentDate = d3.extent(
    data.flatMap((d) => d[1]),
    (d) => d.date
  );
  // deriveK(data, extentDate[0]);
  // const extentK = computeExtentK(data);

  /* scales */
  const scaleX = d3
    .scaleUtc()
    .domain(extentDate)
    .range([margin.left, width - margin.right]);
  const scaleY = d3
    .scaleLinear()
    .range([height - margin.bottom, margin.top]);

  computeNewDataAndYScale(margin.left, data, scaleX, scaleY);

  /* layers and groups */
  // atomatic generate G with margin?
  const backgroundLayer = Libra.Layer.initialize("D3Layer", {
    name: "background",
    width: width,
    height: height,
    container: root.node(),
  });
  const axesTransformer = Libra.GraphicalTransformer.initialize("axesTransformer", {
    layer: backgroundLayer,
    sharedVar: {
      width,
      height,
      margin,
      scaleX,
      scaleY,
    },
  });

  const mainLayer = backgroundLayer.getLayerFromQueue("main");
  const linesTransformer = Libra.GraphicalTransformer.initialize("linesTransformer", {
    layer: mainLayer,
    sharedVar: {
      scaleX,
      scaleY,
      data,
    },
  });

  const helperBarInstrument = Libra.Instrument.initialize("KeyboardHelperBarInstrument", {
    layers: [mainLayer],
    sharedVar: {
      startPos: margin.left,
    },
  });
  helperBarInstrument.on(["left", "right"], function({layer, instrument, event}){
    const barX = instrument.getSharedVar("barX") + margin.left;
    // 
    computeNewDataAndYScale(barX, data, scaleX, scaleY);
    axesTransformer.setSharedVar("scaleY", scaleY);
    linesTransformer.setSharedVar("scaleY", scaleY);
    linesTransformer.setSharedVar("data", data);
  });
}

function registerLinesTransformer() {
  Libra.GraphicalTransformer.register("linesTransformer", {
    constructor: Libra.GraphicalTransformer,
    redraw({ layer, transformer }) {
      const scaleX = transformer.getSharedVar("scaleX");
      const scaleY = transformer.getSharedVar("scaleY");
      const data = transformer.getSharedVar("data");
      const root = d3.select(layer.getGraphic());

      root.selectAll("*").remove();

      const z = d3
        .scaleOrdinal(d3.schemeCategory10)
        .domain(data.map((d) => d.name));
      const line = d3
        .line()
        .x((d) => scaleX(d.date))
        .y((d) => scaleY(d.k));

      const serie = root
        .append("g")
        .style("font", "bold 10px sans-serif")
        .selectAll("g")
        .data(data)
        .join("g")
        .attr("stroke", (d) => z(d[0]));
      serie
        .datum((d) => d[1])
        .append("path")
        .attr("fill", "none")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", (d) => line(d));
    },
  });
}

function registerAxesTransformer() {
  Libra.GraphicalTransformer.register("axesTransformer", {
    constructor: Libra.GraphicalTransformer,
    redraw({ layer, transformer }) {
      const width = transformer.getSharedVar("width");
      const height = transformer.getSharedVar("height");
      const margin = transformer.getSharedVar("margin");
      const scaleX = transformer.getSharedVar("scaleX");
      const scaleY = transformer.getSharedVar("scaleY");

      const root = d3.select(layer.getGraphic()).attr("class", "groupMarks");
      root.selectAll("*").remove();

      const xGroup = root
        .append("g")
        .attr("class", "xAxis")
        .attr("transform", `translate(${0}, ${height - margin.bottom})`);
      const yGroup = root
        .append("g")
        .attr("class", "yAxis")
        .attr("transform", `translate(${margin.left}, ${0})`);

      xGroup
        .call(
          d3
            .axisBottom(scaleX)
            .ticks((width - margin.left - margin.right) / 80)
            .tickSizeOuter(0)
        )
        .call((g) => g.select(".domain").remove());
      yGroup
        .call(d3.axisLeft(scaleY).ticks(null, scaleY.tickFormat(5, "%")))
        .call((g) =>
          g
            .selectAll(".tick line")
            .clone()
            .attr("stroke-opacity", (d) => (d === 1 ? null : 0.2))
            .attr("x2", width - margin.left - margin.right)
        )
        .call((g) => g.select(".domain").remove());
    },
  });
}

function computeNewDataAndYScale(xPos, data, scaleX, scaleY) {
  const date = scaleX.invert(xPos);
  deriveK(data, date);
  const extentK = computeExtentK(data);
  scaleY.domain(extentK);
}

async function loadData() {
  const names = ["IBM", "GOOG", "MSFT", "AAPL", "AMZN"];
  const urls = [IBMURL, GOOGURL, MSFTURL, AAPLURL, AMZNURL];
  const data = await Promise.all(urls.map((url) => d3.csv(url)));
  const parseDate = d3.utcParse("%Y-%m-%d");
  return data.flatMap((dataOneCompony, i) =>
    dataOneCompony.map((d) => ({
      name: names[i],
      date: parseDate(d.Date),
      value: +d.Close,
    }))
  );
}

async function loadData2() {
  const parseDate = d3.utcParse("%m %d %Y");
  return await d3.csv(STOCKSURL, (d) => ({
    name: d.symbol,
    date: new Date(d.date), //parseDate(d.date),
    value: +d.price,
  }));
}

/**
 *
 * @param {[
 * key: string,
 * values: {date: Date, value: number}[]
 * ][]} data
 * @param {Date} date
 * @returns
 */
function deriveK(data, date) {
  data.forEach(([key, items]) => {
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
      items.forEach(({ date, value }, i) => {
        items[i].k = value / baseValue;
      });
    }
  });
  //return data;
}

/**
 * @param {[
 * key: string,
 * values: {date: Date, value: number, k: number}[]
 * ][]} data
 * @returns {[number, number]}
 */
function computeExtentK(data) {
  let minK = Number.MAX_VALUE;
  let maxK = Number.MIN_VALUE;
  data.forEach(([key, values]) => {
    values.forEach(({ k }) => {
      if (k > maxK) maxK = k;
      if (k < minK) minK = k;
    });
    //else if(k < minK) minK = k;
  });
  return [minK, maxK];
}
