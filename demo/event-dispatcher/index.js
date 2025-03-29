// render part
const svg = d3
  .select("#LibraPlayground")
  .append("svg")
  .attr("width", 500)
  .attr("height", 700);

const { circleData, rectData, triangleData } = require("./data");

const circleLayer = Libra.Layer.initialize("D3Layer", {
  name: "circleLayer",
  width: 500,
  height: 500,
  container: svg.node(),
});
const rectLayer = Libra.Layer.initialize("D3Layer", {
  name: "rectLayer",
  width: 500,
  height: 500,
  container: svg.node(),
});
const triangleLayer = Libra.Layer.initialize("D3Layer", {
  name: "triangleLayer",
  width: 500,
  height: 500,
  container: svg.node(),
});

const circleG = d3.select(circleLayer.getGraphic());
circleG
  .selectAll("circle")
  .data(circleData)
  .enter()
  .append("circle")
  .attr("cx", (d) => d.x)
  .attr("cy", (d) => d.y)
  .attr("r", 10)
  .attr("fill", "red")
  .attr("stroke", "black");

const rectG = d3.select(rectLayer.getGraphic());
rectG
  .selectAll("rect")
  .data(rectData)
  .enter()
  .append("rect")
  .attr("x", (d) => d.x)
  .attr("y", (d) => d.y)
  .attr("width", 20)
  .attr("height", 20)
  .attr("fill", "pink")
  .attr("stroke", "black");

const triangleG = d3.select(triangleLayer.getGraphic());
triangleG
  .selectAll("path")
  .data(triangleData)
  .enter()
  .append("path")
  .attr("d", d3.symbol().type(d3.symbolTriangle).size(100))
  .attr("transform", (d) => `translate(${d.x},${d.y})`)
  .attr("fill", "chartreuse")
  .attr("stroke", "black");

svg
  .append("text")
  .attr("y", "550")
  .text("Circle: select radius nearest neighbors (RNN) circles around cursor;");
svg
  .append("text")
  .attr("y", "600")
  .text("Rect: select all rects under cursor;");
svg
  .append("text")
  .attr("y", "650")
  .text("Triangle: select the top triangle under cursor.");

// interaction part
circleLayer.use(
  Libra.Service.initialize("CircleSelectionService", {
    sharedVar: {
      r: 50,
    },
  })
);
rectLayer.use(Libra.Service.initialize("PointSelectionService"));

const hoverInstrument = Libra.Instrument.initialize("HoverInstrument", {
  layers: [circleLayer, rectLayer, triangleLayer],
});

hoverInstrument.on("hover", async ({ layer }) => {
  await Promise.all(layer.services.find("SelectionService").results);
  d3.select(layer.getSiblingLayer("selectionLayer").getGraphic())
    .selectChildren()
    .attr("fill", "blue");
});
