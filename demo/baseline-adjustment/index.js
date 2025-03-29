require("./selectLayer");

main();

async function main() {
  let offset = d3.stackOffsetExpand;

  /*********************** 1. basic settings ******************/
  const fieldX = "Horsepower";
  const fieldY = "Miles_per_Gallon";
  const fieldColor = "Origin";

  const width = 500,
    height = 380;
  const margin = { top: 30, right: 0, bottom: 0, left: 10 };

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  /******************* 2. render static visualization with Libra.Layer ********************/
  const svg = d3
    .select("#LibraPlayground")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewbox", `0 0 width height`);
  const selectGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, 0)`);
  const mainGroup = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const mainLayer = render(mainGroup, innerWidth, innerHeight, offset);

  const options = [
    {
      name: "d3.stackOffsetExpand",
      value: "stackOffsetExpand",
    },
    {
      name: "d3.stackOffsetNone",
      value: "stackOffsetNone",
    },
    {
      name: "d3.stackOffsetSilhouette",
      value: "stackOffsetSilhouette",
    },
    {
      name: "d3.stackOffsetWiggle",
      value: "stackOffsetWiggle",
    },
  ];
  const selectLayer = Libra.Layer.initialize(
    "SelectLayer",
    { options },
    width,
    margin.top,
    selectGroup
  );
  mainLayer.listen({
    layers: [selectLayer],
    updateCommand: function(selectLayer) {
      const offsetString = selectLayer.getSharedVar("value");
      const stack = this.getSharedVar("stack");
      const offset = translateOffset(offsetString);
      stack.offset(offset);
    },
  });
}

function render(root, width, height, offset) {
  const n = 20;
  const m = 200;
  const k = 10;

  const x = d3.scaleLinear([0, m - 1], [0, width]);
  const y = d3.scaleLinear([0, 1], [height, 0]);
  const z = d3.interpolateCool;

  const area = d3
    .area()
    .x((d, i) => x(i))
    .y0((d) => y(d[0]))
    .y1((d) => y(d[1]));
  const stack = d3
    .stack()
    .keys(d3.range(n))
    .offset(offset)
    .order(d3.stackOrderNone);

  const mainLayer = Libra.Layer.initialize("D3Layer", width, height, root);
  const mainGroup = d3.select(mainLayer.getGraphic());

  const path = mainGroup
    .selectAll("path")
    .data(() => randomize(m, n, k, stack, y))
    .join("path")
    .attr("d", area)
    .attr("fill", () => z(Math.random()));

  function setTransition() {
    path
      .data(() => randomize(m, n, k, stack, y))
      .transition()
      .delay(1000)
      .duration(1500)
      .attr("d", area)
      .end();
  }
  setTransition();
  setInterval(setTransition, 2500);

  mainLayer.setSharedVar("stack", stack);

  return mainLayer;
}

function randomize(m, n, k, stack, y) {
  const bumps = bumpsGenerator();
  const layers = stack(
    d3.transpose(Array.from({ length: n }, () => bumps(m, k)))
  );
  y.domain([
    d3.min(layers, (l) => d3.min(l, (d) => d[0])),
    d3.max(layers, (l) => d3.max(l, (d) => d[1])),
  ]);
  return layers;
}

function bumpsGenerator() {
  // Inspired by Lee Byron’s test data generator.
  function bump(a, n) {
    const x = 1 / (0.1 + Math.random());
    const y = 2 * Math.random() - 0.5;
    const z = 10 / (0.1 + Math.random());
    for (let i = 0; i < n; ++i) {
      const w = (i / n - y) * z;
      a[i] += x * Math.exp(-w * w);
    }
  }
  return function bumps(n, m) {
    const a = [];
    for (let i = 0; i < n; ++i) a[i] = 0;
    for (let i = 0; i < m; ++i) bump(a, n);
    return a;
  };
}

function translateOffset(offsetString) {
  switch (offsetString) {
    case "stackOffsetExpand":
      return d3.stackOffsetExpand;
    case "stackOffsetNone":
      return d3.stackOrderNone;
    case "stackOffsetSilhouette":
      return d3.stackOffsetSilhouette;
    case "stackOffsetWiggle":
      return d3.stackOffsetWiggle;
    default:
      throw new Error("no such offset");
  }
}
