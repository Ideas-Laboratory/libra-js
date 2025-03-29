require("./selectInteractor");

const { Layer, Interactor, Instrument, SelectionService } = Libra;

const selectInteractor = Interactor.initialize("SelectInteractor");
const nothingSelectionService = SelectionService.initialize(
  "NothingSelectionService"
);

Instrument.register("SelectInstrument", {
  selectionService: nothingSelectionService,
  relations: [
    {
      attribute: ["select"],
      interactor: selectInteractor,
    },
  ],
  selectCommand(sm, e, layers) {
    const layer = layers[0];
    layer.setSharedVar("value", e.rawEvent.target.value);
    
  },
});
