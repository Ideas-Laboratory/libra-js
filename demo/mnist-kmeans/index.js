// import static visualization and global variables
const VIS = require("./staticVisualization");

async function main() {
  await VIS.loadData();
  VIS.renderStaticVisualization();
  const mainLayer = renderMainVisualization();
  await mountInteraction(mainLayer);
}

function renderMainVisualization() {
  // Find the SVG element on page
  const svg = d3.select("#LibraPlayground svg");

  // Create the main layer
  const mainLayer = Libra.Layer.initialize("D3Layer", {
    name: "mainLayer",
    width: globalThis.WIDTH,
    height: globalThis.HEIGHT,
    offset: { x: globalThis.MARGIN.left, y: globalThis.MARGIN.top },
    container: svg.node(),
  });

  // Draw points
  d3.select(mainLayer.getGraphic())
    .selectAll("circle")
    .data(globalThis.data)
    .join("circle")
    .attr("class", "mark")
    .attr("cx", (d) => globalThis.x(d[globalThis.FIELD_X]))
    .attr("cy", (d) => globalThis.y(d[globalThis.FIELD_Y]))
    .attr("fill", (d) => globalThis.color(d[globalThis.FIELD_COLOR]))
    .attr("fill-opacity", 0.7)
    .attr("r", 3);

  return mainLayer;
}

function renderHullLayer(layer, data, fieldX, fieldY, scaleX, scaleY) {
  const g = d3.select(layer.getGraphic());

  g.selectAll("*").remove();

  const groupedData = d3.group(data, (d) => d.cluster);
  // Find hull for each group
  const hull = Array(10)
    .fill(0)
    .map((_, i) => {
      const group = groupedData.get(i) || [];
      return d3.polygonHull(
        group.map((d) => [scaleX(d[fieldX]), scaleY(d[fieldY])])
      );
    });

  g.selectAll("path")
    .data(hull)
    .join("path")
    .attr("d", (d) => (d ? `M${d.join("L")}Z` : ""))
    .attr("fill", "none")
    .attr("stroke", (d, i) => globalThis.color(i))
    .attr("stroke-width", 2);
}

function renderTransientLayer(layer, data, fieldX, fieldY, scaleX, scaleY) {
  const g = d3.select(layer.getGraphic());

  g.selectAll("*").remove();

  g.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("r", 3)
    .attr("fill", "none")
    .attr("cx", (d) => scaleX(d[fieldX]))
    .attr("cy", (d) => scaleY(d[fieldY]))
    .attr("stroke", (d) => globalThis.color(d.cluster))
    .attr("stroke-opacity", 0.3);
}

function renderCentroidLayer(layer, data, fieldX, fieldY, scaleX, scaleY) {
  const g = d3.select(layer.getGraphic());

  g.selectAll("*").remove();

  g.selectAll(".centroid")
    .data(data)
    .join("rect")
    .attr("class", "centroid")
    .attr("width", 20)
    .attr("height", 20)
    .attr("rx", 5)
    .attr("stroke", "black")
    .attr("x", (d) => scaleX(d[fieldX]) - 5)
    .attr("y", (d) => scaleY(d[fieldY]) - 5)
    .attr("fill", (d) => globalThis.color(d.cluster));
}

async function mountInteraction(mainLayer) {
  const centroids = Array(10)
    .fill(0)
    .map((_, i) => ({
      cluster: i,
      color: globalThis.color(i),
      ...globalThis.data.find((d) => d[globalThis.FIELD_COLOR] === i),
    }));

  window.centroids = centroids;

  // Create Transformers
  const transientKMeansLayer = mainLayer.getLayerFromQueue(
    "transientKMeansLayer"
  );
  const hullLayer = mainLayer.getLayerFromQueue("hullLayer");
  const centroidLayer = mainLayer.getLayerFromQueue("centroidLayer");

  const clusterTransformer = Libra.GraphicalTransformer.initialize(
    "HullTransformer",
    {
      layer: mainLayer,
      sharedVar: {},
      redraw({ transformer }) {
        const result = transformer.getSharedVar("result");
        renderHullLayer(
          hullLayer,
          result?.data ?? [],
          globalThis.FIELD_X,
          globalThis.FIELD_Y,
          globalThis.x,
          globalThis.y
        );
      },
    }
  );

  const transientTransformer = Libra.GraphicalTransformer.initialize(
    "TransientTransformer",
    {
      layer: transientKMeansLayer,
      sharedVar: {},
      redraw({ transformer }) {
        const result = transformer.getSharedVar("result");
        renderTransientLayer(
          transientKMeansLayer,
          result?.data ?? [],
          globalThis.FIELD_X,
          globalThis.FIELD_Y,
          globalThis.x,
          globalThis.y
        );
      },
    }
  );

  const centroidTransformer = Libra.GraphicalTransformer.initialize(
    "CentroidTransformer",
    {
      layer: centroidLayer,
      sharedVar: { centroids: { centroids } },
      redraw({ transformer }) {
        const result = transformer.getSharedVar("centroids");
        renderCentroidLayer(
          centroidLayer,
          result?.centroids ?? [],
          globalThis.FIELD_X,
          globalThis.FIELD_Y,
          globalThis.x,
          globalThis.y
        );
      },
    }
  );

  // Create K-Means service
  const kmeansService = Libra.Service.initialize("KMeansService", {
    constructor: Libra.Service.AnalysisService,
    sharedVar: {
      rawData: globalThis.data,
      result: { centroids },
    },
    command: [
      Libra.Command.initialize("RenderKMeans", {
        async execute({ self }) {
          await self.join();
          const newCentroids = (await self.results).centroids;
          centroids.forEach((centroid, i) => {
            Object.assign(centroid, newCentroids[i]);
          });
        },
      }),
    ],
    joinTransformers: [clusterTransformer, centroidTransformer],
    evaluate({ rawData, result, self }) {
      const { centroids } = result;
      const kMeansResult = kmeans(
        rawData.map((datum) => globalThis.fields.map((field) => datum[field])),
        centroids.length,
        {
          initialization: centroids.map((datum) =>
            globalThis.fields.map((field) => datum[field])
          ),
          maxIterations: self.joining ? 2 : 0,
        }
      );
      return {
        data: rawData.map((datum, i) => ({
          ...datum,
          cluster: kMeansResult.clusters[i],
        })),
        centroids: kMeansResult.centroids.map(({ centroid }, i) => ({
          cluster: i,
          color: globalThis.color(i),
          ...Object.fromEntries(
            globalThis.fields.map((field, ii) => [field, centroid[ii]])
          ),
        })),
      };
    },
  });

  // Attach DragInstrument to the centroid layer
  Libra.Interaction.build({
    inherit: "DragInstrument",
    layers: [centroidLayer],
    sharedVar: {
      handledOffsetX: 0,
      handledOffsetY: 0,
    },
    remove: [
      {
        find: "SelectionTransformer",
      },
    ],
    insert: [
      {
        find: "SelectionService",
        flow: [
          {
            comp: "DataJoinService",
            sharedVar: {
              data: { centroids },
              scaleX: globalThis.x,
              scaleY: globalThis.y,
              fieldX: globalThis.FIELD_X,
              fieldY: globalThis.FIELD_Y,
              replace: true,
            },
          },
          centroidTransformer,
        ],
      },
      {
        find: "DataJoinService",
        flow: [kmeansService, transientTransformer],
      },
    ],
  });

  // Attach HoverInstrument to the main layer
  Libra.Interaction.build({
    inherit: "HoverInstrument",
    layers: [mainLayer],
    sharedVar: {
      tooltip: {
        image: (d) => d.image,
        offset: {
          x: -70 - globalThis.MARGIN.left,
          y: -100 - globalThis.MARGIN.top,
        },
      },
    },
  });
}

main();
