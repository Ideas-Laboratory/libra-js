const loadName = 'testBar.json';
d3.json("./data/" + loadName).then(function(data) {
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

    x.domain(data.map(function(d) { return d.x; }));
    y.domain([0, d3.max(data, function(d) { return d.y; })]);

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

    // Add bars for each data point
    const bars = svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.x); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.y); })
        .attr("height", function(d) { return height - y(d.y); })
        .attr("fill", "steelblue")
        .attr("opacity", 0.7);

    // Add brush (optional)
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
            bars.classed("selected", function(d) {
                const isSelected = selection[0][0] <= x(d.x) && x(d.x) + x.bandwidth() <= selection[1][0] &&
                    selection[0][1] <= y(d.y) && y(d.y) <= selection[1][1];
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
        // Output selected bars to console
        // console.log("Selected bars:", selectedBars);
    }
}).catch(function(error) {
    console.log(error);
});