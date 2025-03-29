// 加载topojson数据
d3.json("data/world-110m.json").then(function (world) {
  // 获取地理特征数据
  const width = 900;
  const height = 500;
  var countries = topojson.feature(world, world.objects.countries);

  // 创建投影
  var projection = d3.geoMercator()
    .scale(150)
    .translate([width / 2, height / 2]);

  // 创建路径生成器
  var path = d3.geoPath()
    .projection(projection);

  // 创建SVG容器
  var svg = d3.select("#LibraPlayground")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // 创建背景矩形
  svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "#ffffff");

  // 绘制经纬线
  svg.append("path")
    .datum(d3.geoGraticule()())
    .attr("class", "graticule")
    .attr("d", path)
    .attr("fill", null)
    .attr("stroke", "#ddd")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "0");

  // 绘制国家边界
  let paths = svg.selectAll(".country")
    .data(countries.features)
    .enter().append("path")
    .attr("class", "country")
    .attr("d", path)
    .attr("fill", "#000")
    .attr("stroke", "#bbb")
    .attr("stroke-width", 1);

  const brush = d3.brush()
    .extent([[0, 0], [width, height]])
    .on("start brush end", brushed);

  svg.append("g")
    .attr("class", "brush")
    .call(brush);

  let selected = [];

  function brushed(event) {
    const selection = event.selection;
    selected = [];
    if (selection) {
      paths.classed("selected", function (d) {
        const bound = d3.select(this).node().getBBox();
        console.log(bound);
        const isSelected =
          (bound.x < selection[1][0] && bound.x + bound.width > selection[0][0]) &&
          (bound.y < selection[1][1] && bound.y + bound.height > selection[0][1]);
        if (isSelected) {
          d3.select(this)
            .attr("fill", "red")
        } else {
          d3.select(this)
            .attr("fill", "#000")
        }
        return isSelected;
      });
    } else {
      paths.attr("fill", "#000")
    }
    // Output selected bars to console
    // console.log("Selected bars:", selectedBars);
  }

});