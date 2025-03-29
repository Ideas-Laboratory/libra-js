const { Layer } = Libra;

Layer.register("KMeansLayer", {
  constructor: Layer.D3Layer,
  sharedVar: {
    elems: [],
    extents: {},
    fieldX: "",
    fieldY: "",
    scaleX: null,
    scaleY: null,
    initialCentroids: [],
    scatterLayer: null,
  },
});

function renderCentroids(
  root,
  centroids,
  fieldX,
  fieldY,
  scaleX,
  scaleY,
  scaleColor
) {
  root.selectAll(".centroid").remove();
  const circles = root
    .selectAll("circle")
    .data(centroids)
    .join("circle")
    .attr("class", "centroid")
    .attr("fill", (centroid) => scaleColor(centroid.cluster))
    .attr("stroke", "black")
    .attr("strokeWidth", 1)
    .attr("opacity", 0.8)
    .attr("cx", (centroid) => scaleX(centroid[fieldX]))
    .attr("cy", (centroid) => scaleY(centroid[fieldY]))
    .attr("r", (scaleX.range()[1] - scaleX.range()[0]) / 20);
  function updateCentroids(centroids) {
    if (centroids) circles.data(centroids);
    circles
      .attr("cx", (centroid) => scaleX(centroid[fieldX]))
      .attr("cy", (centroid) => scaleY(centroid[fieldY]));
  }
  return updateCentroids;
}



function initCentroids(
  extents,
  count = 3,
  scaleColor
  //colors = ["rgb(225,87,89)", "rgb(78,162,167)", "rgb(237,201,73)"]
) {
  const centroids = [];
  for (let i = 0; i < count; i++) {
    const pos = Object.assign({}, extents);
    Object.entries(pos).forEach(
      ([field, extent]) =>
        (pos[field] = (extent[1] - extent[0]) * Math.random())
    );
    centroids.push({ cluster: i, ...pos, color: scaleColor(i) });
  }
  return centroids;
}

module.exports = {
  initCentroids,
  renderCentroids,
};
