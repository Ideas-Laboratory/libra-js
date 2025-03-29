var jsonData;
const loadName = window.location.search.split('file=')[1].split('&')[0];

function draw() {
    console.log(jsonData);
    const plot = Plot.plot({
        marks: [
            Plot.dot(
                jsonData,
                Plot.pointer({
                    x: "x",
                    y: "y",
                    fill: "red",
                    r: 8
                })

            ),
            Plot.dot(jsonData, { x: "x", y: "y" })
        ]
    });
    const div = document.querySelector("#LibraPlayground");
    div.append(plot);
}
fetch("./data/" + loadName)
    .then(response => response.json()) // 将响应解析为 JSON
    .then(data => {
        // 在这里，data 是解析后的 JSON 数据
        jsonData = data;
        console.log(data);
        draw();
    })
    .catch(error => {
        console.error('Error fetching JSON:', error);
    });
