// 加载topojson数据
d3.json("data/world-110m.json").then(function(world) {
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
  svg.selectAll(".country")
    .data(countries.features)
    .enter().append("path")
    .attr("class", "country")
    .attr("d", path)
    .attr("fill", "#000")
    .attr("stroke", "#bbb")
    .attr("stroke-width", 1)
    .on("mousedown", function(d) {
      d3.select(this).attr("fill", "firebrick");
    })
    .on("mouseup", function(d) {
      d3.select(this).attr("fill", "#000");
    });


});