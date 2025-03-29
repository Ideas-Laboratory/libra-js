const loadName = window.location.search.split('file=')[1].split('&')[0];

// 读取 CSV 数据
d3.csv("data/stocks/" + loadName).then(function (data) {
    data = data.map(({ Date: d, Close }) => ({ date: new Date(d), value: +Close }))
    console.log(data);
    // Your D3 code here
    const width = 720;
    const height = 440;
    const focusHeight = 100;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    const x = d3.scaleUtc()
        .domain(d3.extent(data, d => d.date))
        .range([margin.left, width - margin.right])

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .range([height - margin.bottom, margin.top])

    const xAxis = (g, x, height) => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))

    const yAxis = (g, y, title) => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".title").data([title]).join("text")
            .attr("class", "title")
            .attr("x", -margin.left)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text(title))

    const area = (x, y) => d3.area()
        .defined(d => !isNaN(d.value))
        .x(d => x(d.date))
        .y0(y(0))
        .y1(d => y(d.value));

    const chart = (() => {
        const svg = d3
            .select("#LibraPlayground")
            .append('svg')
            .attr('width', width)
            .attr("viewBox", [0, 0, width, height])
            .style("display", "block");

        const clipId = 'clipId';

        svg
            .append("clipPath")
            .attr("id", clipId)
            .append("rect")
            .attr("x", margin.left)
            .attr("y", 0)
            .attr("height", height)
            .attr("width", width - margin.left - margin.right);

        const gx = svg.append("g");

        const gy = svg.append("g");

        const path = svg
            .append("path")
            .datum(data)
            .attr("clip-path", 'url(#' + clipId + ')')
            .attr("fill", "steelblue");

        return Object.assign(svg.node(), {
            update(focusX, focusY) {
                gx.call(xAxis, focusX, height);
                gy.call(yAxis, focusY, data.y);
                path.attr("d", area(focusX, focusY));
            }
        })
    })();


    let [minX, maxX] = [x.domain()[0], x.domain()[1]];

    const focus = (() => {
        const svg = d3
            .select("#LibraPlayground")
            .append('svg')
            .attr('width', width)
            .attr("viewBox", [0, 0, width, focusHeight])
            .style("display", "block");

        const brush = d3
            .brushX()
            .extent([
                [margin.left, 0.5],
                [width - margin.right, focusHeight - margin.bottom + 0.5]
            ])
            .on("brush", brushed)
            .on("end", brushended);

        const defaultSelection = [
            x(d3.utcDay.offset(x.domain()[1], -1)),
            x.range()[1]
        ];

        svg.append("g").call(xAxis, x, focusHeight);

        var brushY = y.copy().range([focusHeight - margin.bottom, 4]);
        svg
            .append("path")
            .datum(data)
            .attr("fill", "steelblue")
            .attr("d", area(x, brushY));

        const gb = svg.append("g").call(brush).call(brush.move, defaultSelection);

        function brushed({ selection }) {
            if (selection) {
                [minX, maxX] = selection.map(x.invert, x).map(d3.utcDay.round);
                const maxY = d3.max(data, d => minX <= d.date && d.date <= maxX ? d.value : NaN);
                chart.update(x.copy().domain([minX, maxX]), y.copy().domain([0, maxY]));
            }
        }

        function brushended({ selection }) {
            if (!selection) {
                gb.call(brush.move, defaultSelection);
            }
        }

        return svg.node();
    })();

    const maxY = d3.max(data, d => minX <= d.date && d.date <= maxX ? d.value : NaN);
    chart.update(x.copy().domain([minX, maxX]), y.copy().domain([0, maxY]));
});