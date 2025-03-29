// global constants
globalThis.MARGIN = { top: 30, right: 70, bottom: 40, left: 60 };
globalThis.WIDTH = 500 - globalThis.MARGIN.left - globalThis.MARGIN.right;
globalThis.HEIGHT = 380 - globalThis.MARGIN.top - globalThis.MARGIN.bottom;
globalThis.FIELD_X = "Horsepower";
globalThis.FIELD_Y = "Miles_per_Gallon";
globalThis.FIELD_COLOR = "Origin";

// global variables
globalThis.data = [];
globalThis.data_detail_level2 = [];
globalThis.data_detail_level1 = [];
globalThis.data_detail_level0 = [];

// shared scales
globalThis.x = null;
globalThis.y = null;
globalThis.color = null;



d3.json("./data/cars.json").then((data) => {
  const binX = (i) =>
    d3
      .bin()
      .value((d) => d[globalThis.FIELD_X])
      .thresholds(i);
  const binY = (i) =>
    d3
      .bin()
      .value((d) => d[globalThis.FIELD_Y])
      .thresholds(i);

  const binXY = (data, i) => binX(i)(data).map(binY(i));
  const mergeXY = (xList) =>
    xList.flatMap((yList) =>
      yList.flatMap((xyList) => {
        const collection = {};
        xyList.forEach((datum) => {
          if (!collection[datum[globalThis.FIELD_COLOR]]) {
            collection[datum[globalThis.FIELD_COLOR]] = [];
          }
          collection[datum[globalThis.FIELD_COLOR]].push(datum);
        });
        return Object.values(collection).map((arr) =>
          arr.reduce(
            (p, c, _, a) => ({
              [globalThis.FIELD_X]:
                p[globalThis.FIELD_X] + c[globalThis.FIELD_X] / a.length,
              [globalThis.FIELD_Y]:
                p[globalThis.FIELD_Y] + c[globalThis.FIELD_Y] / a.length,
              [globalThis.FIELD_COLOR]: c[globalThis.FIELD_COLOR],
              count: p.count + c.count,
            }),
            {
              [globalThis.FIELD_X]: 0,
              [globalThis.FIELD_Y]: 0,
              count: 0,
            }
          )
        );
      })
    );
  globalThis.dataSet = []
  globalThis.data = data.filter(
    (d) => !!(d["Horsepower"] && d["Miles_per_Gallon"])
  );
  globalThis.data_detail_level0 = globalThis.data.map((x) => ({
    ...x,
    count: 1,
  }));
  globalThis.data_detail_level1 = mergeXY(
    binXY(globalThis.data_detail_level0, 10)
  );
  globalThis.data_detail_level2 = mergeXY(
    binXY(globalThis.data_detail_level1, 8)
  );
  globalThis.data_detail_level3 = mergeXY(
    binXY(globalThis.data_detail_level2, 6)
  );
  globalThis.data_detail_level4 = mergeXY(
    binXY(globalThis.data_detail_level3, 4)
  );
  globalThis.data_detail_level5 = mergeXY(
    binXY(globalThis.data_detail_level4, 2)
  );
  globalThis.data_detail_level6 = mergeXY(
    binXY(globalThis.data_detail_level5, 1)
  );
  globalThis.dataSet.push(globalThis.data_detail_level0);
  globalThis.dataSet.push(globalThis.data_detail_level1);
  globalThis.dataSet.push(globalThis.data_detail_level2);
  globalThis.dataSet.push(globalThis.data_detail_level3);
  globalThis.dataSet.push(globalThis.data_detail_level4);
  globalThis.dataSet.push(globalThis.data_detail_level5);
  globalThis.dataSet.push(globalThis.data_detail_level6);

  const svg = d3
    .select("#LibraPlayground")
    .append("svg")
    .attr(
      "width",
      globalThis.WIDTH + globalThis.MARGIN.left + globalThis.MARGIN.right
    )
    .attr(
      "height",
      globalThis.HEIGHT + globalThis.MARGIN.top + globalThis.MARGIN.bottom
    )
    .attr("viewbox", `0 0 ${globalThis.WIDTH} ${globalThis.HEIGHT}`)
    .append("g")
    .attr(
      "transform",
      "translate(" + globalThis.MARGIN.left + "," + globalThis.MARGIN.top + ")"
    );

  const extentX = [0, d3.max(globalThis.data, (d) => d[globalThis.FIELD_X])];
  const extentY = [0, d3.max(globalThis.data, (d) => d[globalThis.FIELD_Y])];

  // Add clip
  svg
    .append("clipPath")
    .attr("id", "clipMainLayer")
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", globalThis.WIDTH)
    .attr("height", globalThis.HEIGHT);

  // Add X scale
  globalThis.x = d3
    .scaleLinear()
    .domain(extentX)
    .range([0, globalThis.WIDTH])
    .nice()
    .clamp(false);

  // Add Y scale
  globalThis.y = d3
    .scaleLinear()
    .domain(extentY)
    .nice()
    .range([globalThis.HEIGHT, 0])
    .clamp(false);

  // Add Legend
  globalThis.color = d3
    .scaleOrdinal()
    .domain(
      new Set(globalThis.data.map((d) => d[globalThis.FIELD_COLOR])).values()
    )
    .range(d3.schemeTableau10);
  svg
    .append("g")
    .call((g) =>
      g
        .append("text")
        .text(globalThis.FIELD_COLOR)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .attr("x", globalThis.WIDTH + globalThis.MARGIN.right / 2)
        .attr("y", -globalThis.MARGIN.top / 2)
    )
    .call((g) =>
      g
        .append("g")
        .selectAll("g")
        .data(
          new Set(
            globalThis.data.map((d) => d[globalThis.FIELD_COLOR])
          ).values()
        )
        .join("g")
        .call((g) => {
          g.append("circle")
            .attr("fill-opacity", "0")
            .attr("stroke-width", 2)
            .attr("stroke", (d) => globalThis.color(d))
            .attr("cx", globalThis.WIDTH + 10)
            .attr("cy", (_, i) => i * 20)
            .attr("r", 5);
        })
        .call((g) => {
          g.append("text")
            .text((d) => d)
            .attr("font-size", "12px")
            .attr("x", globalThis.WIDTH + 20)
            .attr("y", (_, i) => i * 20 + 5);
        })
    );

  // Add X axis
  xAxisGroup = svg.append("g")
    // .attr("transform", "translate(0," + globalThis.HEIGHT + ")")
    .call(d3.axisBottom(globalThis.x))
  // .append("text")
  // .text(globalThis.FIELD_X)
  // .attr("fill", "black")
  // .attr("text-anchor", "middle")
  // .attr("font-size", "12px")
  // .attr("font-weight", "bold")
  // .attr("x", globalThis.WIDTH / 2)
  // .attr("y", 30);

  // Add Y axis
  yAxisGroup = svg.append("g")
    .call(d3.axisLeft(globalThis.y))
  // .append("text")
  // .text(globalThis.FIELD_Y)
  // .attr("fill", "black")
  // .attr("text-anchor", "middle")
  // .attr("font-size", "12px")
  // .attr("font-weight", "bold")
  // .attr("writing-mode", "tb")
  // .style(
  //   "transform",
  //   `translate(${-globalThis.MARGIN.left / 2}px,${globalThis.HEIGHT / 2
  //   }px) rotate(180deg)`
  // );

  function drawNode(data) {
    svg.selectAll(".mark").remove()
    // Draw points code from the input static visualization
    svg.append("g")
      .attr("clip-path", `url(#clipMainLayer)`)
      .selectAll("g")
      .data(data)
      .join("g")
      .attr("class", "mark")
      .call((g) =>
        g
          .append("circle")
          .attr("fill", "white")
          .attr("stroke-width", 1)
          .attr("stroke", (d) => globalThis.color(d[globalThis.FIELD_COLOR]))
          .attr("cx", (d) => globalThis.x(d[globalThis.FIELD_X]))
          .attr("cy", (d) => globalThis.y(d[globalThis.FIELD_Y]))
          .attr("r", (d) => (d.count ?? 0) + 5)
          .attr("class", "main-circle")
      )
      .call((g) =>
        g
          .append("text")
          .attr("fill", (d) => globalThis.color(d[globalThis.FIELD_COLOR]))
          .attr("x", (d) => globalThis.x(d[globalThis.FIELD_X]) - 6)
          .attr("y", (d) => globalThis.y(d[globalThis.FIELD_Y]) + 6)
          .text((d) => ((d.count ?? 1) > 1 ? d.count : ""))
      );
  }
  drawNode(globalThis.data)
  // Create zoom behavior
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  const zoom = d3.zoom()
    .scaleExtent([0.1, 10])
    .on("zoom", (event) => {
      const { transform } = event;
      drawNode(globalThis.dataSet[clamp(Math.floor(transform.k*2),0,6)])
      svg.selectAll(".mark")
        .attr("transform", transform);
      // 更新x轴
      xAxisGroup.call(d3.axisBottom(globalThis.x).scale(event.transform.rescaleX(globalThis.x)));

      // 更新y轴  
      yAxisGroup.call(d3.axisLeft(globalThis.y).scale(event.transform.rescaleY(globalThis.y)));
    });

  // Apply zoom behavior to the SVG container
  svg.call(zoom);

})

