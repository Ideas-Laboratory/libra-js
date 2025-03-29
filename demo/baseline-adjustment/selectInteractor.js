const {Interactor} = Libra;

Interactor.register("SelectInteractor", {
  stopActions: "input",
  rename: {
    $stop: "select",
  },
});