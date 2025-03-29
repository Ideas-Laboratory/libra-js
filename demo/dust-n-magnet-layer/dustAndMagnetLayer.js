require("./dustAndMagnetInstrument");
require("./createMagnetInstrument");
const { Layer, Instrument } = Libra;
Layer.register("DustAndMagnetLayer", {
  constructor: Layer.D3Layer,
  props: {
    properties: [],
    dustElems: []
  },
  preInstall: function () {
    const properties = this.prop("properties");
    const dustElems= this.prop("dustElems");
    const createMagnetInstrument = Instrument.initialize(
      "CreateMagnetInstrument",
      { properties, dustElems }
    );
    const dustAndMagnetInstrument = Instrument.initialize(
      "DustAndMagnetInstrument", {dustElems}
    );

    createMagnetInstrument.attach(this.getGraphic());
    dustAndMagnetInstrument.attach(this.getGraphic());

    this.listen({
      instruments: [createMagnetInstrument, dustAndMagnetInstrument],
    });
  },
});
