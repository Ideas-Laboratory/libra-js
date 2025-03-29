const { Instrument, SelectionService, Interactor } = Libra;

Interactor.register("TrajectoryInteractor2", {
  startActions: "mousedown",
  runningActions: "mousemove",
  //stopActions: ["mouseup", "mouseout"],
  // outsideActions: "mouseup",
  // backInsideActions: "mousedown",
  stopActions: "mouseup",
  rename: {
    active: "start",
    frame: "drag",
    terminate: "end",
  },
});

const trajectoryInteractor = Interactor.initialize("TrajectoryInteractor2");



function registerBrushInstrument() {
  Instrument.register("BrushInstrument2", {
    selectionService: SelectionService.initialize("RectSelectionService"),
    relations: [
      {
        attribute: "x",
        interactor: trajectoryInteractor,
        startCommand: (e) => e.x,
      },
      {
        attribute: "y",
        interactor: trajectoryInteractor,
        startCommand: (e) => e.y,
      },
      {
        attribute: "x",
        interactor: trajectoryInteractor,
        dragCommand: (e, query) => e.x,
      },
      {
        attribute: "y",
        interactor: trajectoryInteractor,
        dragCommand: (e, query) => e.y,
      },
      {
        attribute: "x",
        interactor: trajectoryInteractor,
        endCommand: (e) => e.x,
      },
      {
        attribute: "y",
        interactor: trajectoryInteractor,
        endCommand: (e) => e.y,
      },
    ],
  });
}

module.exports = registerBrushInstrument;
