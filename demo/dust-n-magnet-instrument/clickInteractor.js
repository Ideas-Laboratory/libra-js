const {Interactor} = Libra;

Interactor.register("ClickInteractor", {
  startActions: "mousedown",
  stopActions: "mouseup",
  rename: {
    $start: "start",
    $stop: "end",
  },
});