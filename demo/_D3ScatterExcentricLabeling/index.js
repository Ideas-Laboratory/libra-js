// global constants
globalThis.MARGIN = { top: 30, right: 70, bottom: 40, left: 60 };
globalThis.WIDTH = 500 - globalThis.MARGIN.left - globalThis.MARGIN.right;
globalThis.HEIGHT = 380 - globalThis.MARGIN.top - globalThis.MARGIN.bottom;
globalThis.FIELD_X = "Horsepower";
globalThis.FIELD_Y = "Miles_per_Gallon";
globalThis.FIELD_COLOR = "Origin";

// global variables
globalThis.data = [];

// shared scales
globalThis.x = null;
globalThis.y = null;
globalThis.color = null;



d3.json("./data/cars.json").then((data) => {

  globalThis.data = data.filter(
    (d) => !!(d["Horsepower"] && d["Miles_per_Gallon"])
  );
  globalThis.data_detail_level0 = globalThis.data.map((x) => ({
    ...x,
    count: 1,
  }));

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
  svg.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr(
      "width",
      globalThis.WIDTH + globalThis.MARGIN.left + globalThis.MARGIN.right
    )
    .attr(
      "height",
      globalThis.HEIGHT + globalThis.MARGIN.top + globalThis.MARGIN.bottom
    )
    .attr("fill", "transparent");
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
    .attr("transform", "translate(0," + globalThis.HEIGHT + ")")
    .call(d3.axisBottom(globalThis.x))
    .append("text")
    .text(globalThis.FIELD_X)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("x", globalThis.WIDTH / 2)
    .attr("y", 30);

  // Add Y axis
  yAxisGroup = svg.append("g")
    .call(d3.axisLeft(globalThis.y))
    .append("text")
    .text(globalThis.FIELD_Y)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("writing-mode", "tb")
    .style(
      "transform",
      `translate(${-globalThis.MARGIN.left / 2}px,${globalThis.HEIGHT / 2
      }px) rotate(180deg)`
    );

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

  const selectCircle = svg.append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 20)
    .attr("stroke", "red")
    .attr("fill", "none");
  const selectText = svg.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "mdominant-baseline")
    .attr("fill", "red")
    .text("99");
  const detailTextLeft = svg.append("g")
    .attr("fill", "red")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central");
  const detailLineLeft = svg.append("g")
  .attr("stroke", "red")
  .attr("stroke-opacity", "0.5");
  const detailTextRight = svg.append("g")
    .attr("fill", "red")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central");
  const detailLineRight = svg.append("g")
    .attr("stroke", "red")
    .attr("stroke-opacity", "0.5");

  svg.on("mousemove", function (event) {
    const mouseX = event.offsetX - globalThis.MARGIN.left;
    const mouseY = event.offsetY - globalThis.MARGIN.top;

    selectCircle.attr("cx", mouseX)
      .attr("cy", mouseY);

    const selectedCirclesLeft = d3.selectAll("circle")
      .data(globalThis.data)
      .filter(d => (Math.sqrt((globalThis.x(d[globalThis.FIELD_X]) - mouseX) ** 2 + (globalThis.y(d[globalThis.FIELD_Y]) - mouseY) ** 2) < 20) && globalThis.x(d[globalThis.FIELD_X]) <= mouseX);

    const selectedCirclesRight = d3.selectAll("circle")
      .data(globalThis.data)
      .filter(d => (Math.sqrt((globalThis.x(d[globalThis.FIELD_X]) - mouseX) ** 2 + (globalThis.y(d[globalThis.FIELD_Y]) - mouseY) ** 2) < 20) && globalThis.x(d[globalThis.FIELD_X]) > mouseX);

    selectText.attr("x", mouseX)
      .attr("y", mouseY - 20)
      .text(selectedCirclesLeft.size() + selectedCirclesRight.size());

    const textsLeft = detailTextLeft.selectAll("text")
      .data(selectedCirclesLeft.data());

    textsLeft.enter()
      .append("text")
      .merge(textsLeft)
      // .attr("x", mouseX)
      .attr("y", (d, i) => mouseY + 10 * (i - 0.5 * selectedCirclesLeft.size()))
      .text(d => d.Name)
      .each(function (d) {
        const width = this.getBBox().width;
        d3.select(this)
          .attr("x", mouseX - 30 - (width / 2))
      });

    textsLeft.exit().remove();

    const textsRight = detailTextRight.selectAll("text")
      .data(selectedCirclesRight.data());

    textsRight.enter()
      .append("text")
      .merge(textsRight)
      // .attr("x", mouseX)
      .attr("y", (d, i) => mouseY + 10 * (i - 0.5 * selectedCirclesRight.size()))
      .text(d => d.Name)
      .each(function (d) {
        const width = this.getBBox().width;
        d3.select(this)
          .attr("x", mouseX + 30 + (width / 2))
      });

    textsRight.exit().remove();

    ////lines
    const line = d3.line()
      .x(d => d.x)
      .y(d => d.y);

    const linesLeft = detailLineLeft.selectAll("path")
      .data(selectedCirclesLeft.data().sort(d=>globalThis.y(d[globalThis.FIELD_Y])).map((d, i) => [
        {
          x: globalThis.x(d[globalThis.FIELD_X]),
          y: globalThis.y(d[globalThis.FIELD_Y])
        },
        {
          x: mouseX - 30,
          y: mouseY + 10 * (i - 0.5 * selectedCirclesLeft.size())
        }
      ]));

    linesLeft.enter()
      .append("path")
      .merge(linesLeft)
      // .attr("x", mouseX)
      .attr("d", d => {
        console.log(line(d));
        return line(d)});

    linesLeft.exit().remove();

    const linesRight = detailLineRight.selectAll("path")
    .data(selectedCirclesRight.data().sort(d=>globalThis.y(d[globalThis.FIELD_Y])).map((d, i) => [
      {
        x: globalThis.x(d[globalThis.FIELD_X]),
        y: globalThis.y(d[globalThis.FIELD_Y])
      },
      {
        x: mouseX + 30,
        y: mouseY + 10 * (i - 0.5 * selectedCirclesRight.size())
      }
    ]));

  linesRight.enter()
    .append("path")
    .merge(linesRight)
    // .attr("x", mouseX)
    .attr("d", d => {
      console.log(line(d));
      return line(d)});

  linesRight.exit().remove();
  });
})

