// require("./regressionLensLayer");
// registerRegressionLensInstrument();
registerScatterTransformer();
registerAxesTransformer();
registerHistogramTransformer();
registerRegressionLineTransformer();
const { Instrument, Layer, Service, Command, HistoryManager } = Libra;

main();

/**
 * @param {object} interactionParams
 * @param {string | number} interactionParams.lensRadius
 * @param {string | number} interactionParams.fontSize
 * @param {string | number} interactionParams.maxLabelsNum
 * @param {boolean} interactionParams.shouldVerticallyCoherent open the function: vertically coherent labeling.
 * @param {boolean} interactionParams.shouldHorizontallyCoherent open the function: horizontally coherent labeling.
 */
async function main() {
  /**************** iris dataset ****************/
  //const fields = ["sepal_length", "sepal_width", "petal_length", "petal_width"];
  const data = await d3.csv("./data/bezdekIris.csv");
  const fieldX = "petal_width";
  const fieldY = "petal_length";

  // layout
  const width = 600;
  const height = 600;
  const margin = { top: 100, right: 100, bottom: 100, left: 100 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  /******************** rendering part *********************/
  const svg = d3
    .select("#LibraPlayground")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewbox", `0 0 ${width} ${height}`);
  const root = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  renderScatterPlot(root, innerWidth, innerHeight, fieldX, fieldY, data);

  /******************** interaction part *********************/
  // const extentX = d3.extent(data, (d) => d[fieldX]);
  // const extentY = d3.extent(data, (d) => d[fieldY]);
  // const scaleColor = d3.scaleSequential().domain([1, 2, 3]).range(d3.schemeTableau10);

  // const regressionLensService = Service.initialize("AnalysisService", {
  //   algorithm: ({ data, centroids }) => {
  //     // const kMeansResult = kmeans(
  //     //   data.map((datum) => fields.map((field) => parseFloat(datum[field]))),
  //     //   centroids.length,
  //     //   {
  //     //     initialization: centroids.map((datum) =>
  //     //       fields.map((field) => datum[field])
  //     //     ),
  //     //   }
  //     // );
  //     return data;
  //   },
  //   params: {
  //     data: data,
  //     centroids: [],
  //   },
  //});

  // const regressionLensLayer = Layer.initialize("RegressionLensLayer", {
  //   sharedVar: {
  //     mainLayer,
  //     fieldX,
  //     fieldY,
  //     scaleX,
  //     scaleY,
  //     extentX,
  //     extentY,
  //     thresholdX: [0.5, 2],
  //     thresholdY: [2, 6]
  //   },
  //   services: [regressionLensService],
  //   width: mainLayer._width,
  //   height: mainLayer._height,
  //   container: mainLayer.getContainerGraphic(), //mainLayer.getGraphic(),

  // });

  // const dragInstrument = Instrument.initialize("DragInstrument", {
  //   layers: [regressionLensLayer],
  // });

  // dragInstrument.on("dragend", async ({ layer, instrument }) => {
  //   const fieldX = layer.getSharedVar("fieldX");
  //   const fieldY = layer.getSharedVar("fieldY");
  //   const scaleX = layer.getSharedVar("scaleX");
  //   const scaleY = layer.getSharedVar("scaleY");
  //   const offX = layer.services
  //     .find("SelectionService")
  //     .getSharedVar("offsetx")[0];
  //   const offY = layer.services
  //     .find("SelectionService")
  //     .getSharedVar("offsety")[0];
  //   const offDataX = Math.sign(offX) * scaleX.invert(Math.abs(offX));
  //   const offDataY =
  //     Math.sign(-offY) *
  //     (Math.max(...scaleY.domain()) - scaleY.invert(Math.abs(offY)));

  //   const result = await layer.services.find("SelectionService")[0].oldResults;
  //   try {
  //     const centroid = result.filter((elem) => elem.tagName === "circle")[0]
  //       .__data__;
  //     const dataX = centroid[fieldX];
  //     const dataY = centroid[fieldY];
  //     setTimeout(() => {
  //       centroid[fieldX] = dataX + offDataX;
  //       centroid[fieldY] = dataY + offDataY;
  //       for (let layer of kmLayers) {
  //         const fieldX = layer.getSharedVar("fieldX");
  //         const fieldY = layer.getSharedVar("fieldY");
  //         const scaleX = layer.getSharedVar("scaleX");
  //         const scaleY = layer.getSharedVar("scaleY");
  //         const scaleColor = layer.getSharedVar("scaleColor");
  //         renderCentroids(
  //           d3.select(layer.getGraphic()),
  //           layer.getSharedVar("centroids"),
  //           fieldX,
  //           fieldY,
  //           scaleX,
  //           scaleY,
  //           scaleColor
  //         );
  //       }
  //     }, 0);
  //   } catch {}
  // });
  // dragInstrument.on("dragconfirm", ({ layer }) => {
  //   layer.services
  //     .find("AnalysisService")
  //     .setSharedVar("centroids", layer.getSharedVar("centroids"));
  // });
  // dragInstrument.on(
  //   "dragconfirm",
  //   Command.initialize("ShowKMeansResult", {
  //     execute: async function (options) {
  //       const { layer } = options;
  //       const result = await layer.services.find("AnalysisService").results[0];
  //       const centroids = layer.getSharedVar("centroids");
  //       centroids.forEach((c, i) => {
  //         fields.forEach((field, fi) => {
  //           c[field] = result.centroids[i].centroid[fi];
  //         });
  //       });
  //       await HistoryManager.commit({ ...options, command: this });
  //     },
  //     feedback: [
  //       async ({ layer }) => {
  //         const result = await layer.services.find("AnalysisService")
  //           .results[0];
  //         for (const layer of kmLayers) {
  //           const fieldX = layer.getSharedVar("fieldX");
  //           const fieldY = layer.getSharedVar("fieldY");
  //           const scaleX = layer.getSharedVar("scaleX");
  //           const scaleY = layer.getSharedVar("scaleY");
  //           renderCentroids(
  //             d3.select(layer.getGraphic()),
  //             layer.getSharedVar("centroids"),
  //             fieldX,
  //             fieldY,
  //             scaleX,
  //             scaleY,
  //             scaleColor
  //           );
  //           const scatterLayer = layer.getSharedVar("scatterLayer");
  //           const circles = d3.selectAll(
  //             scatterLayer
  //               .getVisualElements()
  //               .filter((elem) => elem.tagName === "circle")
  //           );
  //           circles.attr("stroke", (_, i) => scaleColor(result.clusters[i]));
  //         }
  //       },
  //     ],
  //   })
  // );
  //layerInfo["kmLayer"] = kMeansLayer;
  //kmLayers.push(kMeansLayer);
}

function renderScatterPlot(root, width, height, fieldX, fieldY, data) {
  // settings
  const radius = 5;
  const tickCount = 5;

  // layout
  const margin = { top: 10, right: 10, bottom: 50, left: 50 };

  // data manipulation
  data = data.filter((d) => !!(d[fieldX] && d[fieldY]));
  const extentX = [0, d3.max(data, (d) => d[fieldX])];
  const extentY = [0, d3.max(data, (d) => d[fieldY])];

  // scales
  const scaleX = d3
    .scaleLinear()
    .domain(extentX)
    .range([margin.left, width - margin.right])
    .nice(tickCount)
    .clamp(true);
  const scaleY = d3
    .scaleLinear()
    .domain(extentY)
    .range([height - margin.bottom, margin.top])
    .nice(tickCount)
    .clamp(true);

  const backgroundLayer = Layer.initialize("D3Layer", {
    width: width,
    height: height,
    container: root.node(),
  });
  Libra.GraphicalTransformer.initialize("axesTransformer", {
    layer: backgroundLayer,
    sharedVar: {
      width,
      height,
      margin,
      scaleX,
      scaleY,
      titleX: fieldX,
      titleY: fieldY,
    },
  });

  const mainLayer = backgroundLayer.getLayerFromQueue("main");
  Libra.GraphicalTransformer.initialize("scatterTransformer", {
    layer: mainLayer,
    sharedVar: {
      scaleX,
      scaleY,
      fieldX,
      fieldY,
      radius,
      data,
    },
  });

  const instrument = Libra.Instrument.initialize("DataBrushInstrument", {
    layers: [mainLayer],
    sharedVar: {
      scaleX,
      scaleY,
      attrNameX: fieldX,
      attrNameY: fieldY,
      highlightAttrValues: {
        fill: "green",
      },
    },
  });

  instrument.on(["drag", "dragend"], async function ({ layer, instrument }) {
    const services = instrument.services.find("SelectionService");
    const [extentX] = services.getSharedVar("extentX");
    const [extentY] = services.getSharedVar("extentY");
    rectTransformer = instrument.transformers.find(
      "TransientRectangleTransformer"
    );
    const rectX = rectTransformer.getSharedVar("x")[0];
    const rectY = rectTransformer.getSharedVar("y")[0];
    const rectWidth = rectTransformer.getSharedVar("width")[0];
    const rectHeight = rectTransformer.getSharedVar("height")[0];
    const marginHistTop = {
      top: rectY - rectHeight / 2,
      right: width - (rectX + rectWidth),
      bottom: height - rectY,
      left: rectX,
    };
    const marginHistLeft = {
      top: rectY,
      right: width - rectX,
      bottom: height - (rectY + rectHeight),
      left: rectX - rectWidth / 2,
    };
    const histLayerTop = backgroundLayer.getLayerFromQueue("histTop");

    //#region draw histograms and regression line
    Libra.GraphicalTransformer.initialize("histogramTransformer", {
      layer: histLayerTop,
      sharedVar: {
        width,
        height,
        margin: marginHistTop,
        data,
        key: fieldX,
        extent: extentX,
        horizontal: true,
      },
    });
    const histLayerBottom = backgroundLayer.getLayerFromQueue("histBottom");
    Libra.GraphicalTransformer.initialize("histogramTransformer", {
      layer: histLayerBottom,
      sharedVar: {
        width,
        height,
        margin: marginHistLeft,
        data,
        key: fieldY,
        extent: extentY,
        horizontal: false,
      },
    });
    const regressionLineLayer = backgroundLayer.getLayerFromQueue(
      "regressionLineLayer"
    );
    Libra.GraphicalTransformer.initialize("regressionLineTransformer", {
      layer: regressionLineLayer,
      sharedVar: {
        data,
        scaleX,
        scaleY,
        fieldX,
        fieldY,
        thresholdX: extentX,
        thresholdY: extentY,
      },
    });
    //#endregion
  });

  // return [mainLayer, scaleX, scaleY];
}

function registerAxesTransformer() {
  Libra.GraphicalTransformer.register("axesTransformer", {
    constructor: Libra.GraphicalTransformer,
    sharedVar: {
      titleX: "",
      titleY: "",
    },
    redraw({ layer, transformer }) {
      const width = transformer.getSharedVar("width");
      const height = transformer.getSharedVar("height");
      const margin = transformer.getSharedVar("margin");
      const scaleX = transformer.getSharedVar("scaleX");
      const scaleY = transformer.getSharedVar("scaleY");
      const titleX = transformer.getSharedVar("titleX");
      const titleY = transformer.getSharedVar("titleY");

      const root = d3.select(layer.getGraphic());
      // groups
      const groupAxisX = root
        .append("g")
        .attr("class", "groupAxisX")
        .attr("transform", `translate(0, ${height - margin.bottom})`);
      const groupAxisY = root
        .append("g")
        .attr("class", "groupAxisY")
        .attr("transform", `translate(${margin.left}, 0)`);

      // draw
      groupAxisX
        .call(d3.axisBottom(scaleX).tickSizeOuter(0))
        .call((g) =>
          g
            .selectAll(".tick line")
            .clone()
            .attr("stroke-opacity", 0.1)
            .attr("y2", -(height - margin.top - margin.bottom))
        )
        .append("text")
        .text(titleX)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .attr("x", (width - margin.left - margin.right) / 2 + margin.left)
        .attr("y", 32);
      groupAxisY
        .call(d3.axisLeft(scaleY))
        .call((g) =>
          g
            .selectAll(".tick line")
            .clone()
            .attr("stroke-opacity", 0.1)
            .attr("x2", width - margin.left - margin.right)
        )
        .append("g")
        .attr(
          "transform",
          `translate(${-margin.left / 2 - 10}, ${
            (height - margin.top - margin.bottom) / 2
          })`
        )
        .append("text")
        .text(titleY)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .style("writing-mode", "tb")
        .attr("transform", "rotate(180)");
    },
  });
}

function registerScatterTransformer() {
  Libra.GraphicalTransformer.register("scatterTransformer", {
    constructor: Libra.GraphicalTransformer,
    redraw({ layer, transformer }) {
      const scaleX = transformer.getSharedVar("scaleX");
      const scaleY = transformer.getSharedVar("scaleY");
      const fieldX = transformer.getSharedVar("fieldX");
      const fieldY = transformer.getSharedVar("fieldY");
      const radius = transformer.getSharedVar("radius");
      const data = transformer.getSharedVar("data");

      const root = d3.select(layer.getGraphic());

      root
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("opacity", 0.5)
        .attr("fill", "none")
        .attr("stroke-width", 1)
        .attr("fill", "grey")
        .attr("cx", (d) => scaleX(d[fieldX]))
        .attr("cy", (d) => scaleY(d[fieldY]))
        .attr("r", radius);
    },
  });
}

function registerHistogramTransformer() {
  Libra.GraphicalTransformer.register("histogramTransformer", {
    constructor: Libra.GraphicalTransformer,
    redraw({ layer, transformer }) {
      const width = transformer.getSharedVar("width");
      const height = transformer.getSharedVar("height");
      const margin = transformer.getSharedVar("margin");
      let data = transformer.getSharedVar("data");
      const key = transformer.getSharedVar("key");
      const extent = transformer.getSharedVar("extent");
      const horizontal = transformer.getSharedVar("horizontal");
      const color = transformer.getSharedVar("color") || "red";

      const root = d3.select(layer.getGraphic());
      root.selectAll("*").remove();

      data = data.filter((d) => extent[0] < d[key] && d[key] < extent[1]);
      const bin = d3
        .bin()
        .domain(extent)
        .value((d) => d[key]);
      const binnedData = bin(data);
      let maxY = 0;
      binnedData.forEach((d) => {
        if (d.length > maxY) maxY = d.length;
      });

      // scales
      const scaleX = d3.scaleLinear().domain(extent).clamp(true);
      const scaleY = d3.scaleLinear().domain([0, maxY]).clamp(true);
      if (horizontal) {
        scaleX.range([margin.left, width - margin.right]);
        scaleY.range([height - margin.bottom, margin.top]);
      } else {
        scaleX.range([height - margin.bottom, margin.top]);
        scaleY.range([width - margin.right, margin.left]);
      }

      const mainRects = root
        .selectAll("new-rect")
        .data(binnedData)
        .join("rect")
        .attr("class", "mark")
        .attr("fill", color)
        .attr("opacity", 0.3);
      if (horizontal) {
        mainRects
          .attr("x", (d, i) => scaleX(d.x0))
          .attr("y", (d) => scaleY(d.length))
          .attr("width", (d) => scaleX(d.x1) - scaleX(d.x0))
          .attr("height", (d) => scaleY(0) - scaleY(d.length));
      } else {
        mainRects
          .attr("y", (d, i) => scaleX(d.x1))
          .attr("x", (d) => scaleY(d.length))
          .attr("height", (d) => scaleX(d.x0) - scaleX(d.x1))
          .attr("width", (d) => scaleY(0) - scaleY(d.length));
      }
    },
  });
}

// function registerRegressionLensInstrument() {
//   Libra.Instrument.register("RegressionLensInstrument", {
//     constructor: Libra.Instrument,
//     interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
//     on: {
//       dragstart: [
//         async ({ event, layer, instrument }) => {
//           if (event.changedTouches) event = event.changedTouches[0];
//           const scaleX = instrument.getSharedVar("scaleX");
//           const scaleY = instrument.getSharedVar("scaleY");
//           const services = instrument.services.find(
//             "Quantitative2DSelectionService"
//           );
//           // services.setSharedVar("x", event.clientX, { layer });
//           // services.setSharedVar("width", 1, { layer });
//           // const
//           // services.setSharedVar("startx", event.clientX, { layer });
//           // services.setSharedVar("currentx", event.clientX, { layer });
//           const layerPos = d3.pointer(event, layer.getGraphic());
//           instrument.setSharedVar("layerOffsetX", event.clientX - layerPos[0]);
//           instrument.setSharedVar("layerOffsetY", event.clientY - layerPos[1]);
//           instrument.setSharedVar("startx", event.clientX);
//           instrument.setSharedVar("starty", event.clientY);

//           const newExtentX = [layerPos[0], layerPos[0] + 1].map(scaleX.invert);
//           services.setSharedVar("extentX", newExtentX);
//           const newExtentY = [layerPos[1], layerPos[1] + 1].map(scaleY.invert);
//           services.setSharedVar("extentX", newExtentY);

//           instrument.transformers
//             .find("TransientRectangleTransformer")
//             .setSharedVars({
//               x: 0,
//               y: 0,
//               width: 1,
//               height: 1,
//             });
//         },
//       ],
//       drag: [
//         Libra.Command.initialize("drawBrushAndSelect", {
//           continuous: true,
//           execute: async ({ event, layer, instrument }) => {
//             if (event.changedTouches) event = event.changedTouches[0];

//             const startx = instrument.getSharedVar("startx");
//             const starty = instrument.getSharedVar("starty");
//             const layerOffsetX = instrument.getSharedVar("layerOffsetX");
//             const layerOffsetY = instrument.getSharedVar("layerOffsetY");
//             const scaleX = instrument.getSharedVar("scaleX");
//             const scaleY = instrument.getSharedVar("scaleY");

//             const x = Math.min(startx, event.clientX) - layerOffsetX;
//             const y = Math.min(starty, event.clientY) - layerOffsetY;
//             const width = Math.abs(event.clientX - startx);
//             const height = Math.abs(event.clientY - starty);

//             instrument.setSharedVar("x", x);
//             instrument.setSharedVar("y", y);
//             instrument.setSharedVar("width", width);
//             instrument.setSharedVar("height", height);

//             const newExtentDataX = [x, x + width].map(scaleX.invert);
//             const newExtentDataY = [y + height, y].map(scaleY.invert);

//             const services = instrument.services.find("SelectionService");
//             services.setSharedVar("extentX", newExtentDataX);
//             services.setSharedVar("extentY", newExtentDataY);
//

//             await Promise.all(instrument.services.results);
//           },
//           feedback: [
//             async ({ event, layer, instrument }) => {
//               const x = instrument.getSharedVar("x");
//               const y = instrument.getSharedVar("y");
//               const width = instrument.getSharedVar("width");
//               const height = instrument.getSharedVar("height");
//               instrument.transformers
//                 .find("TransientRectangleTransformer")
//                 .setSharedVars({
//                   x: x,
//                   y: y,
//                   width: width,
//                   height: height,
//                 });
//             },
//             async ({ instrument }) => {
//               instrument.transformers.find("HighlightSelection").setSharedVars({
//                 highlightAttrValues:
//                   instrument.getSharedVar("highlightAttrValues") || {},
//               });
//             },
//           ],
//         }),
//       ],
//       dragend: [
//         Libra.Command.initialize("clearOrPersistant", {
//           execute: async ({ event, layer, instrument }) => {
//             if (event.changedTouches) event = event.changedTouches[0];
//             if (!instrument.getSharedVar("persistant")) {
//               const services = instrument.services.find("SelectionService");
//               services.setSharedVar("width", -1, { layer });
//             }
//           },
//           feedback: [
//             async ({ event, layer, instrument }) => {
//               if (event.changedTouches) event = event.changedTouches[0];
//               if (!instrument.getSharedVar("persistant")) {
//                 instrument.transformers
//                   .find("TransientRectangleTransformer")
//                   .setSharedVars({
//                     width: 0,
//                     height: 0,
//                   });
//               }
//             },
//           ],
//         }),
//       ],
//       dragabort: [
//         async ({ event, layer, instrument }) => {
//           if (event.changedTouches) event = event.changedTouches[0];
//           const services = instrument.services.find("SelectionService");
//           services.setSharedVar("x", 0, { layer });
//           services.setSharedVar("width", 0, { layer });
//           services.setSharedVar("currentx", event.clientX, { layer });
//           services.setSharedVar("endx", event.clientX, { layer });
//           instrument.transformers
//             .find("TransientRectangleTransformer")
//             .setSharedVars({
//               x: 0,
//               width: 0,
//             });
//         },
//       ],
//     },
//     preAttach: async (instrument, layer) => {
//       const scaleX = instrument.getSharedVar("scaleX");
//       const scaleY = instrument.getSharedVar("scaleY");

//       const attrNameX = instrument.getSharedVar("attrNameX");
//       const extentX = instrument.getSharedVar("extentX") ?? [0, 0];
//       const extentXData = extentX.map(scaleX);
//       const attrNameY = instrument.getSharedVar("attrNameY");
//       const extentY = instrument.getSharedVar("extentY") ?? [0, 0];
//       const extentYData = extentX.map(scaleY).reverse();

//       const services = instrument.services.add(
//         "Quantitative2DSelectionService",
//         { layer }
//       );
//       services.setSharedVar("attrNameX", attrNameX);
//       services.setSharedVar("extentX", extentX);
//       services.setSharedVar("attrNameY", attrNameY);
//       services.setSharedVar("extentY", extentY);

//       instrument.transformers
//         .add("TransientRectangleTransformer", {
//           transient: true,
//           layer: layer.getLayerFromQueue("transientLayer"),
//           sharedVar: {
//             x: extentXData[0],
//             y: extentYData[0],
//             width: extentXData[1] - extentXData[0],
//             height: extentYData[1] - extentYData[0],
//             fill: "#000",
//             opacity: 0.3,
//           },
//         })
//         .add("HighlightSelection", {
//           transient: true,
//           layer: layer.getLayerFromQueue("selectionLayer"),
//           sharedVar: {
//             highlightAttrValues:
//               instrument.getSharedVar("highlightAttrValues") || {},
//           },
//         });

//       await Promise.all(instrument.services.results);
//     },
//   });
// }

function registerRegressionLineTransformer() {
  Libra.GraphicalTransformer.register("regressionLineTransformer", {
    constructor: Libra.GraphicalTransformer,
    redraw({ layer, transformer }) {
      const data = transformer.getSharedVar("data");
      const scaleX = transformer.getSharedVar("scaleX");
      const scaleY = transformer.getSharedVar("scaleY");
      const fieldX = transformer.getSharedVar("fieldX");
      const fieldY = transformer.getSharedVar("fieldY");
      const thresholdX = transformer.getSharedVar("thresholdX");
      const thresholdY = transformer.getSharedVar("thresholdY");

      const root = d3.select(layer.getGraphic());
      root.selectAll("*").remove();

      const x = [];
      const y = [];
      data.forEach((d) => {
        x.push(+d[fieldX]);
        y.push(+d[fieldY]);
      });
      const slr = new SimpleLinearRegression(x, y);
      const predictedY = thresholdX.map((x) => slr.predict(x));
      const lineY = predictedY.map((y) => {
        if (y < thresholdY[0]) return thresholdY[0];
        if (y > thresholdY[1]) return thresholdY[1];
        return y;
      });
      const lineX = lineY.map((y) => slr.computeX(y));
      root
        .append("line")
        .attr("stroke", "blue")
        .attr("stroke-width", 3)
        .attr("x1", scaleX(lineX[0]))
        .attr("x2", scaleX(lineX[1]))
        .attr("y1", scaleY(lineY[0]))
        .attr("y2", scaleY(lineY[1]));
    },
  });
}

// const undoBtn = document.createElement("button");
// undoBtn.addEventListener("click", () => {
//   HistoryManager.undo();
// });
// undoBtn.innerText = "< Undo";

// const redoBtn = document.createElement("button");
// redoBtn.addEventListener("click", () => {
//   HistoryManager.redo();
// });
// redoBtn.innerText = "Redo >";
// document.getElementById("LibraPlayground").appendChild(undoBtn);
// document.getElementById("LibraPlayground").appendChild(redoBtn);
