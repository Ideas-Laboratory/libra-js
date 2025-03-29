Libra.Interactor.register("ShiftTrajectoryInteractor", {
  startActions: "mousedown[event.shiftKey]",
  runningActions: "mousemove[event.shiftKey]",
  stopActions: ["mouseup, keyup[event.key==='Shift']"],
  outsideActions: "mosueleave",
  backInsideActions: "mouseenter",
  rename: {
    $start: "start",
    $running: "drag",
    $stop: "end"
  }
});
