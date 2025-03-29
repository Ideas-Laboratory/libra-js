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
        .attr("opacity", 0.7);;

    // Add brush
    const brush = d3.brush()
        .extent([[0, 0], [width, height]])
        .on("start brush end", brushed);

    svg.append("g")
        .attr("class", "brush")
        .call(brush);

    let selectedPoints = [];

    function brushed(event) {
        const selection = event.selection;
        selectedPoints = [];

        if (selection) {
            dots.classed("selected", function (d) {
                const isSelected = selection[0][0] <= x(d.x) && x(d.x) <= selection[1][0] &&
                    selection[0][1] <= y(d.y) && y(d.y) <= selection[1][1];
                if (isSelected) {
                    d3.select(this)
                        .attr("fill", "red")
                        .attr("opacity", 1);
                } else {
                    d3.select(this).attr("fill", "steelblue")
                        .attr("opacity", 0.7);
                }
                return isSelected;
            });
        } else {
            dots.attr("fill", "steelblue")
                .attr("opacity", 0.7);
        }

        // Output selected points to console
        // console.log("Selected points:", selectedPoints);
    }
}).catch(function (error) {
    console.log(error);
});