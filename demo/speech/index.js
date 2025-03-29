/*********************** 1. basic settings ***********************/
const WIDTH = 500,
  HEIGHT = 300;

/*********************** 2. rendering parts ***********************/
const microPhoneSVG = d3
  .select("#LibraPlayground")
  .append("svg")
  .attr("width", 30)
  .attr("height", 30)
  .attr("viewBox", "-50 -50 1124 1124");

const microPhoneLayer = Libra.Layer.initialize("D3Layer", {
  width: 30,
  height: 30,
  container: microPhoneSVG.node(),
});

d3.select(microPhoneLayer.getGraphic())
  .append("circle")
  .attr("cx", 512)
  .attr("cy", 512)
  .attr("r", 512)
  .attr("fill", "none")
  .attr("stroke", "gray")
  .attr("stroke-width", 50);

const mainLayerSVG = d3
  .select("#LibraPlayground")
  .append("svg")
  .attr("width", WIDTH)
  .attr("height", HEIGHT);

const mainLayer = Libra.Layer.initialize("D3Layer", {
  width: WIDTH,
  height: HEIGHT,
  container: mainLayerSVG.node(),
});

const mainLayerBorder = d3
  .select(mainLayer.getGraphic())
  .append("rect")
  .attr("width", WIDTH)
  .attr("height", HEIGHT)
  .attr("fill", "none")
  .attr("stroke", "green")
  .attr("stroke-width", 5);

const mode = d3
  .select("#LibraPlayground")
  .append("p")
  .text("Current Mode: Muted");

function renderMute() {
  mode.text("Current Mode: Muted");
  d3.select(microPhoneLayer.getGraphic()).selectAll("path").remove();
  d3.select(microPhoneLayer.getGraphic())
    .append("path")
    .attr(
      "d",
      "M412.16 592.128l-45.44 45.44A191.232 191.232 0 01320 512V256a192 192 0 11384 0v44.352l-64 64V256a128 128 0 10-256 0v256c0 30.336 10.56 58.24 28.16 80.128zm51.968 38.592A128 128 0 00640 512v-57.152l64-64V512a192 192 0 01-287.68 166.528l47.808-47.808zM314.88 779.968l46.144-46.08A222.976 222.976 0 00480 768h64a224 224 0 00224-224v-32a32 32 0 1164 0v32a288 288 0 01-288 288v64h64a32 32 0 110 64H416a32 32 0 110-64h64v-64c-61.44 0-118.4-19.2-165.12-52.032zM266.752 737.6A286.976 286.976 0 01192 544v-32a32 32 0 0164 0v32c0 56.832 21.184 108.8 56.064 148.288L266.752 737.6z"
    )
    .attr("fill", "gray");
  d3.select(microPhoneLayer.getGraphic())
    .append("path")
    .attr(
      "d",
      "M150.72 859.072a32 32 0 01-45.44-45.056l704-708.544a32 32 0 0145.44 45.056l-704 708.544z"
    )
    .attr("fill", "gray");
}

function renderMicroPhone() {
  mode.text(
    "Current Mode: Waiting for setting, please speak `add`, `remove` or `clear`"
  );
  d3.select(microPhoneLayer.getGraphic()).selectAll("path").remove();
  d3.select(microPhoneLayer.getGraphic())
    .append("path")
    .attr(
      "d",
      "M512 128a128 128 0 00-128 128v256a128 128 0 10256 0V256a128 128 0 00-128-128zm0-64a192 192 0 01192 192v256a192 192 0 11-384 0V256A192 192 0 01512 64zm-32 832v-64a288 288 0 01-288-288v-32a32 32 0 0164 0v32a224 224 0 00224 224h64a224 224 0 00224-224v-32a32 32 0 1164 0v32a288 288 0 01-288 288v64h64a32 32 0 110 64H416a32 32 0 110-64h64z"
    )
    .attr("fill", "gray");
}

renderMute();

/*********************** 3. interaction parts ***********************/

const onClickAdd = ({ layer, instrument }) => {
  let [x] = instrument.services.find("SelectionService").getSharedVar("x");
  let [y] = instrument.services.find("SelectionService").getSharedVar("y");
  console.log(instrument);
  const bbox = layer.getGraphic().getBoundingClientRect();
  x -= bbox.x;
  y -= bbox.y;
  const circles = d3.select(layer.getGraphic()).selectAll("circle");
  const data = circles.data();
  data.push({ x, y });
  circles
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("r", 10)
    .attr("fill", "blue");
};

const onClickRemove = ({ layer, instrument }) => {
  const results = instrument.services.find("SelectionService")[0].results;
  results.then((result) => {
    d3.selectAll(result.filter((node) => node.tagName === "circle")).remove();
  });
};

const clickInstrument = Libra.Instrument.initialize("ClickInstrument", {
  layers: [mainLayer],
});
clickInstrument.on("click", onClickAdd);

Libra.Instrument.initialize("SpeechInstrument", {
  layers: [microPhoneLayer],
  on: {
    enableSpeech: [renderMicroPhone],
    disableSpeech: [renderMute],
    speech: [
      ({ event }) => {
        mainLayer.setLayersOrder({ selectionLayer: -1 });
        if (
          event.toLowerCase().includes("add") ||
          event.toLowerCase().includes("at") || // alternative recognition result
          event.toLowerCase().includes("bad") || // alternative recognition result
          event.toLowerCase().includes("create") ||
          event.toLowerCase().includes("crate") || // alternative recognition result
          event.toLowerCase().includes("craig") || // alternative recognition result
          event.toLowerCase().includes("creek") // alternative recognition result
        ) {
          mainLayerBorder.attr("stroke", "green");
          clickInstrument.off("click", onClickRemove);
          clickInstrument.on("click", onClickAdd);
          mode.text("Current Mode: Adding");
        } else if (
          event.toLowerCase().includes("delete") ||
          event.toLowerCase().includes("is it") || // alternative recognition result
          event.toLowerCase().includes("did it") || // alternative recognition result
          event.toLowerCase().includes("remove") ||
          event.toLowerCase().includes("camus") || // alternative recognition result
          event.toLowerCase().includes("hello") // alternative recognition result
        ) {
          mainLayerBorder.attr("stroke", "red");
          clickInstrument.off("click", onClickAdd);
          clickInstrument.on("click", onClickRemove);
          mode.text("Current Mode: Remove");
        } else if (event.toLowerCase().includes("clear")) {
          d3.select(mainLayer.getGraphic()).selectAll("circle").remove();
        }
      },
    ],
  },
});
