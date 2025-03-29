Libra.Interactor.register("ShiftSelectInteractor", {
  startActions: ".centroid:mousedown[event.shiftKey]",
  stopActions: ["keyup[event.key==='Shift']"],
  rename: {
    $start: "start",
    $stop: "end",
  },
});