// global constants
globalThis.MARGIN = { top: 0, right: 0, bottom: 0, left: 0 };
globalThis.WIDTH = 700 - globalThis.MARGIN.left - globalThis.MARGIN.right;
globalThis.HEIGHT = 580 - globalThis.MARGIN.top - globalThis.MARGIN.bottom;

// global variables
globalThis.data = [];

// shared scales
globalThis.x = null;
globalThis.y = null;



d3.json("./data/flare-2.json").then((data) => {

  globalThis.dataRoot = d3
    .hierarchy(data)
    .sum(function (d) {
      return d.value;
    })
    .sort((a, b) => b.height - a.height || b.value - a.value);

  globalThis.dataRoot.children.map((node, index) => (node.groupId = index));

  d3.treemap().size([globalThis.WIDTH, globalThis.HEIGHT]).padding(0.5)(
    globalThis.dataRoot
  );

  globalThis.data_detail_level1 = [globalThis.dataRoot].flatMap(
    (node) => node.children || [node]
  );
  globalThis.data_detail_level2 = globalThis.data_detail_level1.flatMap(
    (node) => node.children || [node]
  );
  globalThis.data_detail_level3 = globalThis.data_detail_level2.flatMap(
    (node) => node.children || [node]
  );

  globalThis.data = globalThis.data_detail_level3

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

  // Add x axis
  globalThis.x = d3.scaleLinear().domain([0, 1]).range([0, 1]);

  // Add y axis
  globalThis.y = d3.scaleLinear().domain([0, 1]).range([0, 1]);



  function drawTreemap(data) {
    svg.selectAll(".block").remove()
    // Draw the treemap
    svg.selectAll(".block")
      .data(data)
      .join("g")
      .attr("class", "block")
      .call((g) =>
        g
          .append("rect")
          .attr("fill", "blue")
          .attr("x", function (d) {
            console.log(d);
            return globalThis.x(d.x0);
          })
          .attr("y", function (d) {
            return globalThis.y(d.y0);
          })
          .attr("width", function (d) {
            return globalThis.x(d.x1) - globalThis.x(d.x0);
          })
          .attr("height", function (d) {
            return globalThis.y(d.y1) - globalThis.y(d.y0);
          })
      )
      // .call((g) =>
      //   g
      //     .append("text")
      //     .attr("x", function (d) {
      //       return globalThis.x(d.x0) + 5;
      //     }) // +10 to adjust position (more right)
      //     .attr("y", function (d) {
      //       return globalThis.y(d.y0) + 20;
      //     }) // +20 to adjust position (lower)
      //     .text(function (d) {
      //       return d.data.name;
      //     })
      //     .attr("font-size", "15px")
      //     .attr("fill", "white")
      // );
  }
  drawTreemap(globalThis.data);

  function rectCircleIntersecting(rect, circle) {
    const rectHalfWidth = rect.width / 2;
    const rectHalfHeight = rect.height / 2;
    const circleDistance = {
      x: Math.abs(circle.x - rect.x - rectHalfWidth),
      y: Math.abs(circle.y - rect.y - rectHalfHeight)
    };

    // 检查圆心是否在矩形内
    if (circleDistance.x <= rectHalfWidth && circleDistance.y <= rectHalfHeight) {
      return true;
    }

    // 检查圆心到矩形四边的最短距离是否小于半径
    if (circleDistance.x <= rectHalfWidth || circleDistance.y <= rectHalfHeight) {
      const cornerDistanceSq =
        Math.pow(circleDistance.x - rectHalfWidth, 2) +
        Math.pow(circleDistance.y - rectHalfHeight, 2);
      return cornerDistanceSq <= Math.pow(circle.radius, 2);
    }

    return false;
  }

  const selectCircle = svg.append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 20)
    .attr("stroke", "yellow")
    .attr("stroke-width", "3")
    .attr("fill", "none");
  const selectText = svg.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "mdominant-baseline")
    .attr("fill", "yellow")
    .text("99");
  const detailTextLeft = svg.append("g")
    .attr("fill", "yellow")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central");
  const detailLineLeft = svg.append("g")
    .attr("stroke", "yellow")
    .attr("stroke-opacity", "0.5");
  const detailTextRight = svg.append("g")
    .attr("fill", "yellow")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central");
  const detailLineRight = svg.append("g")
    .attr("stroke", "yellow")
    .attr("stroke-opacity", "0.5");

  svg.on("mousemove", function (event) {
    const mouseX = event.offsetX - globalThis.MARGIN.left;
    const mouseY = event.offsetY - globalThis.MARGIN.top;

    selectCircle.attr("cx", mouseX)
      .attr("cy", mouseY);

    const selectedRectsLeft = d3.selectAll("rect")
      .data(globalThis.data)
      .filter(d => (rectCircleIntersecting(
        { x: d.x0, y: d.y0, width: d.x1 - d.x0, height: d.y1 - d.y0 },
        { x: mouseX, y: mouseY, radius: 20 }
      )) && (d.x0 + d.x1) / 2 <= mouseX);

    const selectedRectsRight = d3.selectAll("rect")
      .data(globalThis.data)
      .filter(d => (rectCircleIntersecting(
        { x: d.x0, y: d.y0, width: d.x1 - d.x0, height: d.y1 - d.y0 },
        { x: mouseX, y: mouseY, radius: 20 }
      )) && (d.x0 + d.x1) / 2 > mouseX);

    selectText.attr("x", mouseX)
      .attr("y", mouseY - 20)
      .text(selectedRectsLeft.size() + selectedRectsRight.size());

    const textsLeft = detailTextLeft.selectAll("text")
      .data(selectedRectsLeft.data());

    textsLeft.enter()
      .append("text")
      .merge(textsLeft)
      // .attr("x", mouseX)
      .attr("y", (d, i) => mouseY + 10 * (i - 0.5 * selectedRectsLeft.size()))
      .text(d => d.data.name)
      .each(function (d) {
        const width = this.getBBox().width;
        d3.select(this)
          .attr("x", mouseX - 30 - (width / 2))
      });

    textsLeft.exit().remove();

    const textsRight = detailTextRight.selectAll("text")
      .data(selectedRectsRight.data());

    textsRight.enter()
      .append("text")
      .merge(textsRight)
      // .attr("x", mouseX)
      .attr("y", (d, i) => mouseY + 10 * (i - 0.5 * selectedRectsRight.size()))
      .text(d => d.data.name)
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
      .data(selectedRectsLeft.data().sort(d => d.y1 + d.y0).map((d, i) => [
        {
          x: (d.x1 + d.x0)/2,
          y: (d.y1 + d.y0)/2
        },
        {
          x: mouseX - 30,
          y: mouseY + 10 * (i - 0.5 * selectedRectsLeft.size())
        }
      ]));

    linesLeft.enter()
      .append("path")
      .merge(linesLeft)
      // .attr("x", mouseX)
      .attr("d", d => {
        console.log(line(d));
        return line(d)
      });

    linesLeft.exit().remove();

    const linesRight = detailLineRight.selectAll("path")
      .data(selectedRectsRight.data().sort(d => d.y1 + d.y0).map((d, i) => [
        {
          x: (d.x1 + d.x0)/2,
          y: (d.y1 + d.y0)/2
        },
        {
          x: mouseX + 30,
          y: mouseY + 10 * (i - 0.5 * selectedRectsRight.size())
        }
      ]));

    linesRight.enter()
      .append("path")
      .merge(linesRight)
      // .attr("x", mouseX)
      .attr("d", d => {
        console.log(line(d));
        return line(d)
      });

    linesRight.exit().remove();
  });
})

