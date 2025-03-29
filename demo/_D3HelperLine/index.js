const loadName = 'testBar.json';
d3.json("./data/" + loadName).then(function (data) {
  // Define margin, width, and height
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const width = 460 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Create scales for x and y axes
  const x = d3.scaleBand()
    .range([0, width])
    .padding(0.1);
  const y = d3.scaleLinear()
    .range([height, 0]);

  x.domain(data.map(function (d) { return d.x; }));
  y.domain([0, d3.max(data, function (d) { return d.y; })]);

  // Create SVG element
  const svg = d3.select("#LibraPlayground")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  const hoverLine = svg.append("g")
    .attr("class", "hover-line")

  // 添加一条空的横线
  hoverLine.append("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", 0)
    .attr("y2", 0)
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .style("opacity", 0);

  // 添加一个空的文本标签
  hoverLine.append("text")
    .attr("x", width - 20)
    .attr("dy", "-0.35em")
    .style("opacity", 0);
  // 监听鼠标在SVG区域内的移动事件
  svg.on("mousemove", function (event) {
    // 获取鼠标在SVG区域内的位置
    const [mouseX, mouseY] = d3.pointer(event);

    // 反向计算y值
    const hoverY = y.invert(mouseY);

    // 更新横线的位置
    hoverLine.select("line")
      .attr("y1", y(hoverY))
      .attr("y2", y(hoverY))
      .style("opacity", 1);

    // 更新文本标签的位置和内容
    hoverLine.select("text")
      .attr("y", y(hoverY))
      .text(hoverY.toFixed(2))
      .style("opacity", 1);
  });

  // 当鼠标离开SVG区域时,重置横线和文本标签
  svg.on("mouseout", function () {
    hoverLine.select("line").style("opacity", 0);
    hoverLine.select("text").style("opacity", 0);
  });



  // Add x-axis
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add y-axis
  svg.append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(y));

  // Add bars for each data point
  const bars = svg.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function (d) { return x(d.x); })
    .attr("width", x.bandwidth())
    .attr("y", function (d) { return y(d.y); })
    .attr("height", function (d) { return height - y(d.y); })
    .attr("fill", "steelblue")
    .attr("opacity", 0.7);

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
}).catch(function (error) {
  console.log(error);
});