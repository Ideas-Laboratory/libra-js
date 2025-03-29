const {Interactor} = Libra;

// Interactor.register("ContinuousClickInteractor", {
//   startActions: "mousedown",
//   frameActions: "mousedown",
//   rename: {
//     active: "start",
//     frame: "click",
//   },
// });

Interactor.register("ClickInteractor", {
  startActions: "mousedown",
  stopActions: "mouseup",
  rename: {
    $start: "start",
    $stop: "end",
  },
});