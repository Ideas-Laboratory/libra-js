const svg = d3
  .select("#LibraPlayground")
  .append("svg")
  .attr("width", 500)
  .attr("height", 500);

const data = new Array(100)
  .fill()
  .map(() => ({ x: Math.random() * 480 + 10, y: Math.random() * 480 + 10 }));

const mainLayer = Libra.Layer.initialize("D3Layer", {
  name: "mainLayer",
  width: 500,
  height: 500,
  container: svg.node(),
});

Libra.GraphicalTransformer.initialize("DrawMainLayer", {
  layer: mainLayer,
  redraw({ layer }) {
    const g = d3.select(layer.getGraphic());

    g.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 10)
      .attr("fill", "red")
      .attr("stroke", "black");
  },
});

// interaction part
const instrument = Libra.Interaction.build({
  inherit: "HoverInstrument",
  layers: [mainLayer],
  sharedVar: {
    highlightAttrValues: {
      fill: "blue",
    },
  },
});
