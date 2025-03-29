const { getBackground } = require("./helper");

/**
 * expose three objects with setSharedVar：start/end/brushLayer
 * @param {} layer
 * @param {*} brushInstrument
 */
let _start = [0, 0];
function setBrushCommands(layer, brushInstrument) {
  layer.listen({
    instrument: brushInstrument,
    startCommand: function (_, e) {
      const preBrushLayer = this.getSharedVar("brushLayer");
      d3.select(preBrushLayer?.getGraphic()).remove();
      _start = [e.x, e.y];
      const brushLayer = Libra.Layer.initialize(
        "D3Layer",
        0,
        0,
        d3.select(this.getGraphic())
      );
      const rect = getBackground(brushLayer);
      rect
        .attr("opacity", 0.3)
        .attr("transform", `translate(${_start[0]}, ${_start[1]})`);

      this.setSharedVar("brushLayer", brushLayer);
      this.setSharedVar("start", _start);
    },
    dragCommand: function (_, e) {
      const brushLayer = this.getSharedVar("brushLayer");
      const start = [Math.min(_start[0], e.x), Math.min(_start[1], e.y)];
      const end = [Math.max(_start[0], e.x), Math.max(_start[1], e.y)];

      const rect = getBackground(brushLayer);
      const width = end[0] - start[0];
      const height = end[1] - start[1];
      rect
        .attr("transform", `translate(${start[0]}, ${start[1]})`)
        .attr("width", width)
        .attr("height", height);

      this.setSharedVar("start", start);
      this.setSharedVar("end", end);
    },
  });
}

module.exports = setBrushCommands;
