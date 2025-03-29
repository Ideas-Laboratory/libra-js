const loadName = 'testBar.json';
d3.json("./data/" + loadName).then(function (data) {
  const width = 600;
  const height = 400;
  const marginTop = 20;
  const marginRight = 0;
  const marginBottom = 30;
  const marginLeft = 40;


  // Create the horizontal scale and its axis generator.
  const x = d3.scaleBand()
    .domain(d3.sort(data, d => -d.y).map(d => d.x))
    .range([marginLeft, width - marginRight])
    .padding(0.1);



  // Create the vertical scale.
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.y)]).nice()
    .range([height - marginBottom, marginTop]);

  // Create the SVG container and call the zoom behavior.
  const svg = d3
    .select("#LibraPlayground")
    .append("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .attr("style", "max-width: 100%; height: auto;")

  // Append the bars.
  svg.append("g")
    .attr("class", "bars")
    .attr("fill", "steelblue")
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", d => x(d.x))
    .attr("y", d => y(d.y))
    .attr("height", d => y(0) - y(d.y))
    .attr("width", x.bandwidth());

  // Append the axes.
  const xAxisGroup = svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x));

  const yAxisGroup = svg.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove());


  // Create zoom behavior
  const zoom = d3.zoom()
    .scaleExtent([0.1, 10])
    .on("zoom", (event) => {
      const { transform } = event;
      //   svg.selectAll("rect")
      //     .attr("transform", transform);
      //   svg.selectAll(".x-axis")
      //     .attr("transform", transform);
      const originalRangeX = [marginLeft, width - marginRight];
      const newRangeX = originalRangeX.map(v => (v + transform.x) * transform.k);

      const originalRangeY = [height - marginBottom, marginTop];
      rangeYextent = marginTop - height + marginBottom;
      const newRangeY = [height - marginBottom, height - marginBottom + transform.k * rangeYextent];
      x.range(newRangeX);
      y.range(newRangeY);

      svg.selectAll("rect")
        .attr("x", d => x(d.x))
        .attr("y", d => y(d.y))
        .attr("height", d => y(0) - y(d.y))
        .attr("width", x.bandwidth());
      xAxisGroup.call(d3.axisBottom(x));
      yAxisGroup.call(d3.axisLeft(y));
      // yAxisGroup.call(d3.axisLeft(y).scale(transform.rescaleY(y)));
    });
  svg.call(zoom);
}).catch(function (error) {
  console.log(error);
});