const data = {
  name: "Root",
  children: [
    { name: "A", value: 10 },
    { name: "B", value: 20 },
    { name: "C", value: 30 },
    { name: "D", value: 40 },
    { name: "E", value: 50 }
  ]
};
const [width, height] = [960, 500]
// Create a treemap layout
const treemap = d3.treemap()
  .size([width, height]);

// Construct the treemap hierarchy
const root = d3.hierarchy(data)
  .sum(d => d.value)
  .sort((a, b) => b.value - a.value);

// Compute the treemap layout
treemap(root);

// Append a SVG group to hold the treemap
const svg = d3
  .select("#LibraPlayground")
  .append("svg")
  .attr("viewBox", [0, 0, width, height])
  .attr("width", width)
  .attr("height", height)
  .attr("style", "max-width: 100%; height: auto;")
  .attr("transform", "translate(0,0)");
const padding = 2;
// Append the treemap rectangles
const bars = svg.selectAll("rect")
  .data(root.leaves())
  .enter()
  .append("rect")
  .attr("x", d => d.x0 + padding)
  .attr("y", d => d.y0 + padding)
  .attr("width", d => d.x1 - d.x0 - 2 * padding)
  .attr("height", d => d.y1 - d.y0 - 2 * padding)
  .attr("fill", "steelblue");

// Append the treemap text
svg.selectAll("text")
  .data(root.leaves())
  .enter()
  .append("text")
  .attr("x", d => (d.x0 + d.x1) / 2)
  .attr("y", d => (d.y0 + d.y1) / 2)
  .attr("text-anchor", "middle")
  .attr("dominant-baseline", "middle")
  .attr("fill", "white")
  .style("font-family", "Arial, sans-serif")
  .style("font-size", "12px")
  .text(d => d.data.name);

const brush = d3.brush()
  .extent([[0, 0], [width, height]])
  .on("start brush end", brushed);

svg.append("g")
  .attr("class", "brush")
  .call(brush);

let selectedBars = [];

function brushed(event) {
  const selection = event.selection;
  selectedBars = [];
  if (selection) {
    bars.classed("selected", function (d) {
      console.log(d);
      const isSelected =
        (d.x0 < selection[1][0] && d.x1 > selection[0][0]) &&
        (d.y0 < selection[1][1] && d.y1 > selection[0][1]);
      if (isSelected) {
        d3.select(this)
          .attr("fill", "red")
          .attr("opacity", 1);
      } else {
        d3.select(this)
          .attr("fill", "steelblue")
          .attr("opacity", 0.7);
      }
      return isSelected;
    });
  } else {
    bars.attr("fill", "steelblue")
      .attr("opacity", 0.7);
  }
}
