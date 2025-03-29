main();
function main() {
  const width = 600;
  const height = 400;
  const showlayers = false;
  const deltas = [-100, -4, -1, 0];
  const minZoomLevel = 0;
  const maxZoomLevel = 4;
  const url = (x, y, z) =>
    `https://api.mapbox.com/v4/mapbox.satellite/${z}/${x}/${y}.png?access_token=pk.eyJ1IjoidmlydXNwYyIsImEiOiJja2xjZ3ljcGQwcDRiMnBwMGY5cGl6M2wzIn0.fjAvh4hJmiB-aG5pzNzJpw`;

  /******************* 2. render static visualization with Libra.Layer ********************/
  const svg = d3
    .select("#LibraPlayground")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewbox", `0 0 width height`);

  const scaleX = d3.scaleLinear().domain([0, 1]).range([0, width]);
  const scaleY = d3.scaleLinear().domain([0, 1]).range([0, height]);
  const tile = d3
    .tile()
    .extent([
      [0, 0],
      [width, height],
    ])
    .tileSize(512)
    .clampX(false);

  const mainLayer = Libra.Layer.initialize("D3Layer", {
    width,
    height,
    container: svg.node(),
  });

  registerMapTransformer();
  const mapTransformer = Libra.GraphicalTransformer.initialize(
    "mapTransformer",
    {
      layer: mainLayer,
      sharedVar: {
        url,
        tile,
        scaleX,
        scaleY,
        originalRangeX: width,
      },
    }
  );
  Libra.Instrument.initialize("PanInstrument", {
    layers: [{ layer: mainLayer, options: { pointerEvents: 'all' } }],
    sharedVar: {
      transformers: [mapTransformer],
    },
  });

  Libra.Instrument.initialize("ZoomInstrument", {
    layers: [{ layer: mainLayer, options: { pointerEvents: 'all' } }],
    sharedVar: {
      transformers: [mapTransformer],
    },
  });
}

function registerMapTransformer() {
  Libra.GraphicalTransformer.register("mapTransformer", {
    constructor: Libra.GraphicalTransformer,
    redraw({ layer, transformer }) {
      
      const url = transformer.getSharedVar("url");
      const tile = transformer.getSharedVar("tile");
      const scaleX = transformer.getSharedVar("scaleX");
      const scaleY = transformer.getSharedVar("scaleY");
      const originalRangeX = transformer.getSharedVar("originalRangeX");

      const root = d3.select(layer.getGraphic()).attr("class", "groupMarks");

      const baseZoomScale = 1024;
      const domainX = scaleX.domain();
      const domainY = scaleY.domain();
      const centroidX =
        ((scaleX(domainX[1]) - scaleX(domainX[0])) >> 1) + scaleX(domainX[0]);
      const centroidY =
        ((scaleY(domainY[1]) - scaleY(domainY[0])) >> 1) + scaleY(domainY[0]);
      const rangeX = scaleX.range();
      const zoomScale = (rangeX[1] - rangeX[0]) / originalRangeX;

      const transform = d3.zoomIdentity
        .translate(centroidX, centroidY)
        .scale(baseZoomScale * zoomScale);
      const tiles = tile.zoomDelta(0)(transform);

      root
        .selectAll("image")
        .data(tiles, (d) => d)
        .join("image")
        .attr("xlink:href", (d) => url(...d3.tileWrap(d)))
        .attr("x", ([x]) => (x + tiles.translate[0]) * tiles.scale)
        .attr("y", ([, y]) => (y + tiles.translate[1]) * tiles.scale)
        .attr("width", tiles.scale)
        .attr("height", tiles.scale);
    },
  });
}
