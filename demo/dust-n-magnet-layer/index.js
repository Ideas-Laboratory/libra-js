//const setCreateMagnetCommands = require("./setCreateMagnetCommands");
// require("./dustAndMagnetInstrument");
// require("./createMagnetInstrument");
require("./dustAndMagnetLayer");
const { Layer } = Libra;

main();

async function main() {
  const cars = await d3.json("./data/cars.json");

  const data = getRandomData(cars);

  const width = 800,
    height = 600;

  const svg = d3
    .select("#LibraPlayground")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewbox", `0 0 width height`);

  const dusts = render(svg, width, height, data);

  /***** add interaction *****/
  const properties = [];
  const datum = data[0];
  for (const property in datum) {
    const value = datum[property];
    if (typeof value === "number") {
      properties.push(property);
    }
  }
  const dustAndMagnetLayer = Layer.initialize(
    "DustAndMagnetLayer",
    {
      properties,
      dustElems: dusts.nodes(),
      dustDataAccessor: (dustElem) => d3.select(dustElem).datum(),
    },
    width,
    height,
    svg
  );
}

function getRandomData(data, number = 10) {
  return data.sort(() => (Math.random() < 0.5 ? -1 : 1)).slice(0, number);
}

function render(root, width, height, data) {
  const radius = 10;

  const mainLayer = Libra.Layer.initialize("D3Layer", {
    width,
    height,
    container: root.node(),
  });

  const background = d3.select(mainLayer.query("rect")[0]);
  background.attr("fill", "#eee").attr("opacity", 1);

  const mainGroup = d3.select(mainLayer.getGraphic());
  const dusts = mainGroup
    .selectAll("circle")
    .data(data)
    .join("circle")
    .classed("dust", true)
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("r", radius);

  return dusts;
}
