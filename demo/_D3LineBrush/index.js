const loadName = 'testLineforD3.json';
d3.json("./data/" + loadName).then(function (data) {
  // Define margin, width, and height
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const width = 460 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Create scales for x and y axes

  const x = d3.scaleLinear()
    .range([0, width]);
  const y = d3.scaleLinear()
    .range([height, 0]);

  x.domain([0, d3.max(data[0], function (d) { return d.x; })]);
  y.domain([0, d3.max(data[0].concat(data[1]), function (d) { return d.y; })]);

  // Create SVG element
  const svg = d3.select("#LibraPlayground")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Add x-axis
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add y-axis
  svg.append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(y));

  const line = d3.line()
    .x(d => x(d.x))
    .y(d => y(d.y));
  const path = svg.selectAll(".line")
    .data(data)
    .enter().append("path")
    .attr("class", "line")
    .attr("d", d => line(d))
    .attr("stroke", "black")
    .attr("stroke-width", "2")
    .attr("fill", "none");


  // Add labels
  svg.append("text")
    .attr("class", "label")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom)
    .style("text-anchor", "middle")
    .text("x");

  svg.append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("y");

  // Add brush
  const brush = d3.brush()
    .extent([[0, 0], [width, height]])
    .on("start brush end", brushed);

  svg.append("g")
    .attr("class", "brush")
    .call(brush);

/**
 * 判断线段是否与矩形相交
 * @param {number} x1 线段起点x坐标
 * @param {number} y1 线段起点y坐标
 * @param {number} x2 线段终点x坐标
 * @param {number} y2 线段终点y坐标
 * @param {number} rx1 矩形左上角x坐标
 * @param {number} ry1 矩形左上角y坐标
 * @param {number} rx2 矩形右下角x坐标
 * @param {number} ry2 矩形右下角y坐标
 * @returns {boolean} 线段与矩形是否相交
 */
function isLineIntersectRect(x1, y1, x2, y2, rx1, ry1, rx2, ry2) {
  // 计算矩形的宽度和高度
  const rw = rx2 - rx1;
  const rh = ry2 - ry1;

  // 判断线段的两个端点是否都在矩形外部
  if (
    (x1 < rx1 && x2 < rx1) ||
    (x1 > rx2 && x2 > rx2) ||
    (y1 < ry1 && y2 < ry1) ||
    (y1 > ry2 && y2 > ry2)
  ) {
    return false;
  }

  // 判断矩形的四个顶点是否都在线段同一侧
  const d1 = direction(x1, y1, x2, y2, rx1, ry1);
  const d2 = direction(x1, y1, x2, y2, rx2, ry1);
  const d3 = direction(x1, y1, x2, y2, rx2, ry2);
  const d4 = direction(x1, y1, x2, y2, rx1, ry2);

  if ((d1 > 0 && d2 > 0 && d3 > 0 && d4 > 0) || (d1 < 0 && d2 < 0 && d3 < 0 && d4 < 0)) {
    return false;
  }

  return true;
}

/**
 * 计算点Q到线段P1P2的有向距离
 * @param {number} x1 线段起点x坐标
 * @param {number} y1 线段起点y坐标
 * @param {number} x2 线段终点x坐标
 * @param {number} y2 线段终点y坐标
 * @param {number} x 点Q的x坐标
 * @param {number} y 点Q的y坐标
 * @returns {number} 点Q到线段P1P2的有向距离
 */
function direction(x1, y1, x2, y2, x, y) {
  return (x - x1) * (y2 - y1) - (y - y1) * (x2 - x1);
}


  function polylineIntersectsRect(polyline, rectX1, rectY1, rectX2, rectY2) {
    for (let i = 0; i < polyline.length - 1; i++) {
      const x1 = x(polyline[i].x);
      const y1 = y(polyline[i].y);
      const x2 = x(polyline[i + 1].x);
      const y2 = y(polyline[i + 1].y);


      if (isLineIntersectRect(x1, y1, x2, y2, rectX1, rectY1, rectX2, rectY2)) {
        return true;
      }
    }

    return false;
  }

  let selectedLines = [];

  function brushed(event) {
    const selection = event.selection;
    selectedLines = [];

    if (selection) {
      path.classed("selected", function (d) {
        console.log(d, selection);
        const isSelected = polylineIntersectsRect(d, selection[0][0], selection[0][1], selection[1][0], selection[1][1]);
        if (isSelected) {
          d3.select(this)
            .attr("stroke", "red")
            .attr("opacity", 1);
        } else {
          d3.select(this).attr("stroke", "steelblue")
            .attr("opacity", 0.7);
        }
        return isSelected;
      });
    } else {
      path.attr("stroke", "steelblue")
        .attr("opacity", 0.7);
    }

    // Output selected points to console
    // console.log("Selected points:", selectedLines);
  }

}).catch(function (error) {
  console.log(error);
});