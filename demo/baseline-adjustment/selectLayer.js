require("./selectInstrument");
const {Layer, Interactor, Instrument, SelectionService} = Libra;

Layer.register("SelectLayer", {
  constructor: Layer.D3Layer,
  props: {
    options: []
  },
  preInstall: function () {
    const options = this.prop("options");
    const root = d3.select(this.getGraphic());
    root.attr("xmlns:xhtml", "http://www.w3.org/1999/xhtml")
    const foreignObject = root.append("foreignObject")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", this._width)
      .attr("height", this._height)
    const select = foreignObject
      .append("xhtml:select")
      .attr("name", "select");
    for(const option of options){
      select.append("option")
        .attr("value", option.value)
        .text(option.name)
    }

    const selectInstrument = Instrument.initialize("SelectInstrument");
    selectInstrument.attach(this.getGraphic());
    this.listen({
      instrument: selectInstrument,
      selectCommand: () => {
        // Do not remove this command. 
        // There are some bug with Libra, 
        // if you remove it, the other layers cannot listen to this one.
      }
    })
  }
});