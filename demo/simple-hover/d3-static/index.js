import * as d3 from "d3";

const svg = d3.select("#LibraPlayground").append('svg').attr('width', 500).attr('height', 500);

const g = svg.append("g");
g.selectAll("circle")
  .data(
    new Array(100)
      .fill()
      .map(() => ({ x: Math.random() * 480 + 10, y: Math.random() * 480 + 10 }))
  )
  .enter()
  .append("circle")
  .attr("cx", (d) => d.x)
  .attr("cy", (d) => d.y)
  .attr("r", 10)
  .attr("fill", "red");