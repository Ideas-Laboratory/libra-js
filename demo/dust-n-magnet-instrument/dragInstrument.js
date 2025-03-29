const helper = require("./helper");
const { Instrument, SelectionService, Interactor } = Libra;

const trajectoryInteractor = Interactor.initialize("TrajectoryInteractor");
const pointSelectionService = SelectionService.initialize("PointSelectionService");


Instrument.unregister("DragInstrument");
Instrument.register("DragInstrument", {
  selectionService: pointSelectionService,
  relations: [
    {
      attributes: ["x", "y"],
      interactor: trajectoryInteractor,
      startCommand: (e) => [e.x, e.y],
      dragCommand: (e) => [e.x, e.y],
    },
  ],
  startCommand: function(sm, e, layers){
    
    const layer = layers[0];
    layer.setSharedVar("pre", [e.x, e.y]);
  },
  dragCommand: function(sm, e, layers){
    const layer = layers[0];
    const _pre = layer.getSharedVar(_pre);
    this.setSharedVar("offset", [e.x-_pre[0], e.y-_pre[1]]);
    this.setSharedVar("pre", [e.x, e.y]);
  },
  dragFeedback: function(sm, e, layers){
    
    const layer = layers[0];
    const group = d3.select(layer.getGraphic());
    const offset = this.getSharedVar("offset");
    const xy = helper.getXYfromTransform();
    group.attr("transform", `translate(${xy[0] + offset[0]}, ${xy[1] + offset[1]})`)
  }
});
