function getBackground(layer) {
  return d3.select(layer.getGraphic()).select(".ig-layer-background") ?? null;
}

function getXYfromTransform(node) {
  try {
    const transform = node
      .attr("transform")
      .split("(")[1]
      .split(")")[0]
      .split(",")
      .map((i) => parseFloat(i));
    return transform;
  } catch (e) {
    return [0, 0];
  }
}

function isPointerOnLayerBackground(layer, e) {
  let x = e.clientX;
  let y = e.clientY;
  x = Math.round(x);
  y = Math.round(y);
  if (!layer) return false;
  const elemUnderPointer = document.elementFromPoint(x, y);
  const rect = getBackground(layer).node();
  if (elemUnderPointer === rect) {
    return true;
  }
  return false;
}

module.exports = {
  getBackground,
  getXYfromTransform,
  isPointerOnLayerBackground,
};
