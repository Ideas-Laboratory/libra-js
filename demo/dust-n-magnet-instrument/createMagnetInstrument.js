// require("./clickInteractor");
const helper = require("./helper");
const { Instrument, Interactor } = Libra;

Instrument.register("CreateMagnetInstrument", {
  sharedVar: {
    magnetWidth: 50,
    magnetHeight: 50,
    magnetClassName: "magnet",
    dustClassName: "dust",
    properties: [],
  },
  preAttach: (instrument, layer) => {
    layer.services.find("SelectionService", "PointSelectionService");
  },
  interactors: ["ClickInteractor"],
  startCommand: function (sm, e, layers) {
    const layer = layers[0];
    const next = layer.getSharedVar("next");
    if (!next) layer.setSharedVar("next", 0);
  },
  startFeedback: function (sm, e, layers) {
    
    
    const layer = layers[0];
    const [
      magnetWidth,
      magnetHeight,
      magnetClassName,
      dustClassName,
      properties,
    ] = this.props([
      "magnetWidth",
      "magnetHeight",
      "magnetClassName",
      "dustClassName",
      "properties",
    ]);

    if (properties.length <= 0) return;
    if (!helper.isPointerOnLayerBackground(layer, e.rawEvent)) return;

    const dusts = d3.selectAll(layer.query(`.${dustClassName}`));
    const next = layer.getSharedVar("next");
    
    const property = properties[next % properties.length];
    const data = dusts.data();
    const extent = d3.extent(data, (d) => d[property]);

    createMagnet(
      d3.select(layer.getGraphic()),
      e.x,
      e.y,
      magnetWidth,
      magnetHeight,
      magnetClassName,
      { property, min: extent[0], max: extent[1] }
    );

    layer.setSharedVar("next", next + 1);
  },
});

function createMagnet(
  root,
  x,
  y,
  magnetWidth,
  magnetHeight,
  magnetClassName,
  shared
) {
  const magnetGroup = root.append("g");

  magnetGroup
    .classed(magnetClassName, true)
    .attr("transform", `translate(${x}, ${y})`);

  magnetGroup
    .append("rect")
    .attr("x", -magnetWidth / 2)
    .attr("y", -magnetHeight / 2)
    .attr("width", magnetWidth)
    .attr("height", magnetHeight)
    .attr("fill", "orange")
    .attr("opacity", 0.8);

  magnetGroup
    .append("text")
    .text(shared.property)
    .style("text-anchor", "middle")
    .style("font-size", "12")
    .style("font-weight", "700");

  magnetGroup.datum(shared);
}
