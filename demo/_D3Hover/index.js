const loadName = 'test100.json';

d3.json("./data/" + loadName).then(function (data) {
    // Define margin, width, and height
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 260 - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    // Create scales for x and y axes
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.x)])
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.y)])
        .range([height, 0]);

    // Create SVG element
    const svg = d3
        .select("#LibraPlayground")
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

    // Add dots for each data point
    const dots = svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.x))
        .attr("cy", d => y(d.y))
        .attr("r", 5)
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
        .text("Miles per Gallon");

    // Add hover functionality
    dots.on("mouseover", function (event, d) {
        d3.select(this)
            .attr("fill", "red")
            .attr("opacity", 1);
    })
        .on("mouseout", function (event, d) {
            d3.select(this)
                .attr("fill", "steelblue")
                .attr("opacity", 0.7);
        });
}).catch(function (error) {
    console.log(error);
});