// require("./brushInstrument");

main();

async function main() {
  const cars = await d3.json("./data/cars.json");

  /*********************** 1. basic settings ******************/
  const fieldX = "Horsepower";
  const fieldY = "Miles_per_Gallon";
  const fieldColor = "Origin";

  const width = 500,
    height = 380;

  /******************* 2. render visualization with Libra.Layer ********************/
  const svg = d3
    .select("#LibraPlayground")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewbox", `0 0 width height`);

  renderBrushableScatterPlot(
    svg,
    width,
    height,
    cars,
    fieldX,
    fieldY,
    fieldColor
  );

  /**
   * @param {d3.Selection<SVGGElement, unknown, unknown, unknown>} root
   * @param {number} width
   * @param {number} height
   * @param {unknown[]} data
   * @param {string} fieldX
   * @param {string} fieldY
   * @param {string} fieldColor
   * @returns
   */
  function renderBrushableScatterPlot(
    root,
    width,
    height,
    data,
    fieldX,
    fieldY,
    fieldColor
  ) {
    // settings
    const radius = 3;
    const margin = { top: 10, right: 100, bottom: 40, left: 60 };

    /** 1. data manipulation **/
    data = data.filter((d) => !!(d[fieldX] && d[fieldY]));
    const extentX = [0, d3.max(data, (d) => d[fieldX])];
    const extentY = [0, d3.max(data, (d) => d[fieldY])];
    const valuesColorSet = new Set();
    for (const datum of data) {
      valuesColorSet.add(datum[fieldColor]);
    }
    const valuesColor = Array.from(valuesColorSet);
    const scaleX = d3
      .scaleLinear()
      .domain(extentX)
      .range([margin.left, width - margin.right])
      .nice()
      .clamp(true);
    const scaleY = d3
      .scaleLinear()
      .domain(extentY)
      .range([height - margin.bottom, margin.bottom])
      .nice()
      .clamp(true);
    const scaleColor = d3
      .scaleOrdinal()
      .domain(valuesColor)
      .range(d3.schemeTableau10);

    /** 2. main layer */
    /** 2.1 layer */
    const mainLayer = Libra.Layer.initialize("D3Layer", {
      name: "main",
      width,
      height,
      container: root.node(),
    });
    /** 2.2 transformer */
    registerDrawMainLayerTransformer();
    Libra.GraphicalTransformer.initialize("DrawMainLayer", {
      layer: mainLayer,
      sharedVar: { scaleX, scaleY, fieldX, fieldY, margin, data, radius },
    });
    /** 2.3 instrument */
    const highlightAttr = "stroke";
    const highlightValue = (d) => (d ? scaleColor(d[fieldColor]) : "none");
    Libra.Instrument.initialize("BrushInstrument", {
      layers: [mainLayer],
      sharedVar: {
        highlightAttrValues: { [highlightAttr]: highlightValue },
      },
    });

    /** 3. background layer */
    /** 3.1 layer (sibling) */
    const backgroundLayer = mainLayer.getLayerFromQueue("background");
    /** 3.2 transformer*/
    registerDrawBackgroundLayerTransformer();
    Libra.GraphicalTransformer.initialize("DrawBackgroundLayer", {
      layer: backgroundLayer,
      sharedVar: {
        width,
        height,
        margin,
        scaleX,
        scaleY,
        scaleColor,
        fieldX,
        fieldY,
        fieldColor,
      },
    });
  }
}

function registerDrawBackgroundLayerTransformer() {
  Libra.GraphicalTransformer.register("DrawBackgroundLayer", {
    constructor: Libra.GraphicalTransformer,
    redraw({ layer, transformer }) {
      const width = transformer.getSharedVar("width");
      const height = transformer.getSharedVar("height");
      const margin = transformer.getSharedVar("margin");
      const scaleX = transformer.getSharedVar("scaleX");
      const scaleY = transformer.getSharedVar("scaleY");
      const scaleColor = transformer.getSharedVar("scaleColor");
      const fieldX = transformer.getSharedVar("fieldX");
      const fieldY = transformer.getSharedVar("fieldY");
      const fieldColor = transformer.getSharedVar("fieldY");

      const backgroundGroup = d3
        .select(layer.getGraphic())
        .attr("class", "backgroundLayer");
      // groups
      const groupAxisX = backgroundGroup
        .append("g")
        .attr("class", "groupAxisX")
        .attr("transform", `translate(0, ${height - margin.bottom})`);
      const groupAxisY = backgroundGroup
        .append("g")
        .attr("class", "groupAxisY")
        .attr("transform", `translate(${margin.left}, 0)`);
      const groupLegends = backgroundGroup
        .append("g")
        .attr("class", "groupLegends")
        .attr("transform", `translate(${width - margin.right}, ${margin.top})`);

      // draw
      groupAxisX
        .call(d3.axisBottom(scaleX))
        .append("text")
        .text(fieldX)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .attr("x", width / 2)
        .attr("y", 30);
      groupAxisY
        .call(d3.axisLeft(scaleY))
        .append("g")
        .attr("transform", `translate(${-margin.left / 2 - 5}, ${height / 2})`)
        .append("text")
        .text(fieldY)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .style("writing-mode", "tb")
        .attr("transform", "rotate(180)");

      renderScatterLegends(
        groupLegends,
        margin.right,
        height,
        fieldColor,
        scaleColor
      );
    },
    // sharedVar: {
    //   width,
    //   height,
    //   margin,
    //   scaleX,
    //   scaleY,
    //   scaleColor,
    //   fieldX,
    //   fieldY,
    //   fieldColor,
    // },
  });
}

function registerDrawMainLayerTransformer() {
  Libra.GraphicalTransformer.register("DrawMainLayer", {
    // layer: mainLayer,
    constructor: Libra.GraphicalTransformer,
    redraw({ layer, transformer }) {
      const scaleX = transformer.getSharedVar("scaleX");
      const scaleY = transformer.getSharedVar("scaleY");
      const fieldX = transformer.getSharedVar("fieldX");
      const fieldY = transformer.getSharedVar("fieldY");
      const radius = transformer.getSharedVar("radius");
      const margin = transformer.getSharedVar("margin");
      const clipPathID = transformer.getSharedVar("clipPathID");
      const data = transformer.getSharedVar("data");

      const mainGroup = d3
        .select(layer.getGraphic())
        .attr("class", "mainLayer");
      mainGroup
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("class", "mark")
        .attr("fill", "none")
        .attr("stroke-width", 2)
        .attr("stroke", "gray")
        .attr("cx", (d) => scaleX(d[fieldX]))
        .attr("cy", (d) => scaleY(d[fieldY]))
        .attr("r", radius);
    },
    // sharedVar: {
    //   scaleX,
    //   scaleY,
    //   fieldX,
    //   fieldY,
    //   margin,
    //   data,
    // },
  });
}

/**
 * render the legends of scatter plot
 * @param {d3.Selection} root
 * @param {number} width
 * @param {number} height
 * @param {string} field
 * @param {d3.ScaleOrdinal} scaleColor
 */
function renderScatterLegends(root, width, height, field, scaleColor) {
  // settings
  const radius = 4;

  // layout
  const margin = { top: 30, right: 50, bottom: (height / 6) * 5, left: 10 };
  width -= margin.left + margin.right;
  height -= margin.top + margin.bottom;
  // data manipulation
  const domain = scaleColor.domain();

  // scale
  const scaleY = d3.scalePoint().domain(domain).range([height, 0]);

  // groups
  const groupTitle = root
    .append("g")
    .attr("class", "groupTitle")
    .attr("transform", `translate(${margin.left + width / 2}, ${5})`);
  const groupAxisY = root
    .append("g")
    .attr("class", "groupAxisY")
    .attr("transform", `translate(${margin.left + width}, ${margin.top})`);
  const groupMarks = root
    .append("g")
    .attr("class", "groupMarks")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // draw
  groupTitle.append("text").attr("text-anchor", "start").text(field);
  groupAxisY
    .call(d3.axisRight(scaleY))
    .call((g) => g.selectAll(".domain").remove());
  groupMarks
    .selectAll("circle")
    .data(domain)
    .join("circle")
    .attr("fill", "none")
    .attr("stroke-width", 2)
    .attr("stroke", (d) => scaleColor(d))
    .attr("cx", width / 2)
    .attr("cy", (d) => scaleY(d))
    .attr("r", radius);
}
