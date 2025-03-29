const { Instrument, Layer, Service } = Libra;

Layer.register("RegressionLensLayer", {
  constructor: Layer.D3Layer,
  sharedVar: {
    fieldX: "",
    fieldY: "",
    scaleX: null,
    scaleY: null,
    extentX: [0, 0],
    extentY: [0, 0],
    thresholdX: [0, 0],
    thresholdY: [0, 0],
    mainLayer: null,
  },
  transformation: {
    scaleX: null,
    scaleY: null,
  },
  services: [],
  postInitialize: function (layer) {
    const mainLayer = layer.getSharedVar("mainLayer");
    d3.select(layer.getGraphic()).attr(
      "transform",
      d3.select(mainLayer.getGraphic()).attr("transform")
    );


    const linearRegressionService = Service.initialize("AnalysisService", {
      evaluate: ({data, fieldX, fieldY}) => {
        
        if(data === undefined) return null;
        const x = [];
        const y = [];
        data.forEach((d) => {
          x.push(+d[fieldX]);
          y.push(+d[fieldY]);
        });
        const slr = new SimpleLinearRegression(x, y);
        return slr;
      },
      params: {
        data: [],
        fieldX: "",
        fieldY: "" 
      }
    });
   linearRegressionService.setSharedVar("fieldX", layer.getSharedVar("fieldX"));
   linearRegressionService.setSharedVar("fieldY", layer.getSharedVar("fieldY"));

    mainLayer.use(linearRegressionService);

    const brushInstrument = Instrument.initialize("DataBrushInstrument", {
      layers: [mainLayer],
      sharedVar: {
        // mainLayer: mainLayer,
        attrNameX: layer.getSharedVar("fieldX"),
        attrNameY: layer.getSharedVar("fieldY"),
        extentX: layer.getSharedVar("thresholdX"),
        extentY: layer.getSharedVar("thresholdY"),
      },
    });

    // remove histograms
    brushInstrument.on(["dragstart"], async function () {
      const histLayer = layer.getSiblingLayer("histLayer");
      d3.select(histLayer.getGraphic())
        .selectAll("*").remove();
      const lineLayer = layer.getSiblingLayer("lineLayer");
      d3.select(lineLayer.getGraphic())
        .selectAll("*").remove();

    });

    // green circle and draw histograms
    brushInstrument.on(["drag", "dragend"], async function () {
      const selectionService = mainLayer.services.find("SelectionService");
      await Promise.all(selectionService.results);
      const data = d3
        .select(mainLayer.getSiblingLayer("selectionLayer").getGraphic())
        .selectChildren("circle")
        .data();
      const linearRegressionService = mainLayer.services
          .find("AnalysisService")
      linearRegressionService.setSharedVar("data", data);
      // const result = await layer.services.find("AnalysisService")
      const slr = await linearRegressionService.results[0]

      const fieldX = layer.getSharedVar("fieldX");
      const fieldY = layer.getSharedVar("fieldY");
      const scaleX = layer.getSharedVar("scaleX");
      const scaleY = layer.getSharedVar("scaleY");

      

      // 1. green circles
      d3.select(mainLayer.getSiblingLayer("selectionLayer").getGraphic())
        .selectChildren("circle")
        .attr("fill", "green");

      // 2. histograms
      const thresholdX = selectionService.getSharedVar("extentX")[0];
      const thresholdY = selectionService.getSharedVar("extentY")[0];
      layer.setSharedVar("thresholdX", thresholdX);
      layer.setSharedVar("thresholdY", thresholdY);
      const transientRect = d3
        .select(mainLayer.getSiblingLayer("transientLayer").getGraphic())
        .select("rect");
      const brushX = +transientRect.attr("x");
      const brushY = +transientRect.attr("y");
      const brushWidth = +transientRect.attr("width");
      const brushHeight = +transientRect.attr("height");

      const histLayer = layer.getSiblingLayer("histLayer");
      const root = d3.select(histLayer.getGraphic())
      root.selectAll("*").remove();

      // 2.1 histgramX
      const histXHeight = brushWidth / 2;
      const histXRoot = root.append("g");
      histXRoot.attr("transform", `translate(${brushX}, ${brushY - histXHeight})`);
      renderHistogram(histXRoot, brushWidth, histXHeight, data, fieldX, scaleX, thresholdX);

      // 2.2 histgramY
      const histYheight = brushHeight / 2;
      const histYRoot = root.append("g");
      histYRoot.attr("transform", `translate(${brushX - histYheight}, ${brushY})`);
      renderHistogram(histYRoot, histYheight, brushHeight, data, fieldY, scaleY, thresholdY, false);

      // 3. linear regression
      const lineLayer = layer.getSiblingLayer("lineLayer");
      const lineRoot = d3.select(lineLayer.getGraphic())
      let line = lineRoot.select("line")
      if(!line.node())  line = lineRoot.append("line");
      // const predictedY = thresholdX.map(slr.predict);
      const predictedY = thresholdX.map(x => slr.predict(x));
      const lineY = predictedY.map(y => {
        if(y<thresholdY[0]) return thresholdY[0]
        if(y>thresholdY[1]) return thresholdY[1]
        return y
      })
      const lineX = lineY.map(y => slr.computeX(y));
      line.attr("stroke", "blue")
        .attr("stroke-width", 3)
        .attr("x1", scaleX(lineX[0]))
        .attr("x2", scaleX(lineX[1]))
        .attr("y1", scaleY(lineY[0]))
        .attr("y2", scaleY(lineY[1]))
    });

    mainLayer.services.find("SelectionService").setSharedVar("deepClone", true);
  },
});

/**
 *
 * @param {d3.Selection<SVGGElement, unknown, unknown, unknown>} root
 * @param {number} width
 * @param {number} height
 * @param {unknown} data
 * @param {string} key bin data with the "key" property
 * @returns
 */
function renderHistogram(
  root,
  width,
  height,
  data,
  key,
  scale,
  extent,
  horizontal = true,
  color = "red"
) {
  
  // data manipulation
  const bin = d3
    .bin()
    .domain(extent)
    .value((d) => d[key])
  const binnedData = bin(data);
  let maxY = 0;
  binnedData.forEach((d) => {
    if (d.length > maxY) maxY = d.length;
  });

  // scales
  const scaleX = d3.scaleLinear().domain(extent).clamp(true);
  const scaleY = d3.scaleLinear().domain([0, maxY]).clamp(true);
  if(horizontal){
    scaleX.range([0, width]);
    scaleY.range([height, 0]);
  } else {
    scaleX.range([height, 0]);
    scaleY.range([0, width]);
  }

  const mainRects = root
    .selectAll("new-rect")
    .data(binnedData)
    .join("rect")
    .attr("class", "mark")
    .attr("fill", color)
    .attr("opacity", 0.3)
  if(horizontal){
    mainRects.attr("x", (d, i) => scaleX(d.x0))
    .attr("y", (d) => scaleY(d.length))
    .attr("width", d => scaleX(d.x1) - scaleX(d.x0))
    .attr("height", (d) => scaleY(0) - scaleY(d.length));
  } else {
    mainRects.attr("y", (d, i) => scaleX(d.x1))
    .attr("x", (d) => width - scaleY(d.length))
    .attr("height", d => scaleX(d.x0) - scaleX(d.x1))
    .attr("width", (d) => scaleY(d.length) -scaleY(0) );
  }
}
