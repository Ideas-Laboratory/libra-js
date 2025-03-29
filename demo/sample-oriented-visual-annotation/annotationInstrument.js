const {Layer, Instrument, Interactor, SelectionService}  = Libra;

const nothingSelectionService = SelectionService.initialize("NothingSelectionService");
const hoverInteractor = interactor.initialize("HoverInteractor");

Instrument.register("AnnotationInstrument", {
  selectionService: nothingSelectionService,
  relations: [{
    attribute: ["nothing"],
    interactor: hoverInteractor,
  }],
  pointerCommand() {}
});

