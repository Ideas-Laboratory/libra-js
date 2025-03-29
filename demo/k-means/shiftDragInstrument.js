require("./shiftTrajectoryInteractor");
const helper = require("./helper");
const { Instrument, Service, Interactor } = Libra;

const shiftTrajectoryInteractor = Interactor.initialize(
  "ShiftTrajectoryInteractor"
);
const pointSelectionService = Service.initialize(
  "PointSelectionService"
);


Instrument.register("ShiftDragInstrument", {
  selectionService: pointSelectionService,
  relations: [
    {
      attribute: ["x", "y"],
      interactor: shiftTrajectoryInteractor,
      startCommand: (e) => [e.x, e.y],
      dragCommand: (e) => [e.x, e.y],
    },
  ],
  startCommands: [
    function (sm, e, layers) {
      // 
      const layer = layers[0];
      const { result } = sm;
      layer.setSharedVar("pre", [e.x, e.y]);
      if (result.length <= 0) {
        layer.setSharedVar("target", null);
      }
      layer.setSharedVar("target", result[0]);
    },
  ],
  dragCommands: [
    function (sm, e, layers) {
      const layer = layers[0];
      const pre = layer.getSharedVar("pre");
      layer.setSharedVar("offset", [e.x - pre[0], e.y - pre[1]]);
      layer.setSharedVar("pre", [e.x, e.y]);
    },
  ],
});
