// import static visualization and global variables
const VIS = require("./staticVisualization");

async function main() {
  await VIS.loadData();
  VIS.renderStaticVisualization();
  const mainLayers = renderMainVisualization();
  await mountInteraction(mainLayers);
}

function renderMainVisualization() {
  // Find the SVG element on page
  const svg = d3.select("#LibraPlayground svg");

  // Create the main layers
  const mainLayers = globalThis.fields.map((_, x) =>
    globalThis.fields.map((_, y) => {
      const cellOffsetX = (x * globalThis.WIDTH) / globalThis.fields.length;
      const cellOffsetY = (y * globalThis.HEIGHT) / globalThis.fields.length;
      return Libra.Layer.initialize("D3Layer", {
        name: "mainLayer",
        width:
          globalThis.WIDTH / globalThis.fields.length -
          globalThis.MARGIN.left -
          globalThis.MARGIN.right,
        height:
          globalThis.HEIGHT / globalThis.fields.length -
          globalThis.MARGIN.top -
          globalThis.MARGIN.bottom,
        offset: {
          x: cellOffsetX + globalThis.MARGIN.left * 2,
          y: cellOffsetY + globalThis.MARGIN.top * 2,
        },
        container: svg.node(),
      });
    })
  );

  return mainLayers;
}

function renderMainLayer(layer, data, fieldX, fieldY, scaleX, scaleY) {
  const g = d3.select(layer.getGraphic());

  g.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("r", 3)
    .attr("cx", (d) => scaleX(d[fieldX]))
    .attr("cy", (d) => scaleY(d[fieldY]))
    .attr("fill", (d) => globalThis.color(d.cluster));
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
    .attr("stroke", (d) => globalThis.color(d.cluster));
}

function renderCentroidLayer(layer, data, fieldX, fieldY, scaleX, scaleY) {
  const g = d3.select(layer.getGraphic());

  g.selectAll("*").remove();

  g.selectAll(".centroid")
    .data(data)
    .join("rect")
    .attr("class", "centroid")
    .attr("width", 10)
    .attr("height", 10)
    .attr("rx", 3)
    .attr("stroke", "black")
    .attr("x", (d) => scaleX(d[fieldX]) - 5)
    .attr("y", (d) => scaleY(d[fieldY]) - 5)
    .attr("fill", (d) => globalThis.color(d.cluster));
}

async function mountInteraction(mainLayers) {
  const centroids = globalThis.fields.map((_, i) => ({
    cluster: i,
    color: globalThis.color(i),
    ...Object.fromEntries(
      globalThis.fields
        .map((field) => [
          field,
          d3.extent(globalThis.data.map((d) => d[field])),
        ])
        .map(([field, extent]) => [
          field,
          (extent[1] - extent[0]) * Math.random() + extent[0],
        ])
    ),
  }));

  // Create Transformers
  const transformers = mainLayers.flatMap((lcol, x) =>
    lcol.map((layer, y) => {
      const transientKMeansLayer = layer.getLayerFromQueue(
        "transientKMeansLayer"
      );
      const centroidLayer = layer.getLayerFromQueue("centroidLayer");

      const mainTransformer = Libra.GraphicalTransformer.initialize(
        "MainTransformer",
        {
          layer,
          sharedVar: {},
          redraw({ transformer }) {
            const result = transformer.getSharedVar("result");
            renderMainLayer(
              layer,
              result?.data ?? [],
              globalThis.fields[x],
              globalThis.fields[y],
              globalThis.x[x],
              globalThis.y[y]
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
              globalThis.fields[x],
              globalThis.fields[y],
              globalThis.x[x],
              globalThis.y[y]
            );
          },
        }
      );

      const centroidTransformer = Libra.GraphicalTransformer.initialize(
        "CentroidTransformer",
        {
          layer: centroidLayer,
          sharedVar: {},
          redraw({ transformer }) {
            const result = transformer.getSharedVar("result");
            renderCentroidLayer(
              centroidLayer,
              result?.centroids ?? [],
              globalThis.fields[x],
              globalThis.fields[y],
              globalThis.x[x],
              globalThis.y[y]
            );
          },
        }
      );

      return [mainTransformer, transientTransformer, centroidTransformer];
    })
  );

  // Create K-Means service
  const kmeansService = Libra.Service.initialize("KMeansService", {
    constructor: Libra.Service.AnalysisService,
    sharedVar: {
      data: globalThis.data,
      centroids: centroids,
    },
    transformers: transformers.map((t) => t[1]),
    joinTransformers: transformers.flatMap((t) => [t[0], t[2]]),
    evaluate({ data, centroids, self }) {
      const kMeansResult = kmeans(
        data.map((datum) => globalThis.fields.map((field) => datum[field])),
        centroids.length,
        {
          initialization: centroids.map((datum) =>
            globalThis.fields.map((field) => datum[field])
          ),
          maxIterations: self.joining ? 1 : 100,
        }
      );
      return {
        data: data.map((datum, i) => ({
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
  mainLayers.forEach((lcol, x) =>
    lcol.forEach((layer, y) => {
      const centroidLayer = layer.getLayerFromQueue("centroidLayer");

      layer.setLayersOrder({ selectionLayer: -1 }); // Hide selection layer

      Libra.Instrument.initialize("DragInstrument", {
        layers: [centroidLayer],
      })
        .on("dragstart", ({ instrument }) => {
          instrument.setSharedVar("handledOffsetX", 0);
          instrument.setSharedVar("handledOffsetY", 0);
        })
        .on("drag", async ({ instrument }) => {
          const selection = await instrument.services.find(
            "SelectionService"
          )[0].results;
          if (selection && selection.length) {
            const el = d3.selectAll(selection);
            const datum = el.datum();
            const currentCentroids = kmeansService.getSharedVar("centroids");
            const changingDatum = currentCentroids.find(
              (d) => d.cluster === datum.cluster
            );
            const fieldX = globalThis.fields[x];
            const fieldY = globalThis.fields[y];
            const scaleX = globalThis.x[x];
            const scaleY = globalThis.y[y];

            changingDatum[fieldX] = scaleX.invert(
              scaleX(changingDatum[fieldX]) +
                parseFloat(instrument.getSharedVar("offsetx"))
            );
            if (fieldY !== fieldX) {
              changingDatum[fieldY] = scaleY.invert(
                scaleY(changingDatum[fieldY]) +
                  parseFloat(instrument.getSharedVar("offsety"))
              );
            }

            kmeansService.setSharedVar("centroids", currentCentroids);
            transformers.forEach(
              (
                transformer // Update all the centroid layers
              ) =>
                transformer[2].setSharedVar("result", {
                  centroids: currentCentroids,
                })
            );
          }
        })
        .on(
          "dragconfirm",
          Libra.Command.initialize("RenderKMeans", {
            async execute() {
              // Maybe record the current K-Means result to database by reading `kmeansService.results`
              await kmeansService.join();
              await kmeansService.setSharedVar(
                "centroids",
                (
                  await kmeansService.results
                ).centroids
              );
            },
          })
        );
    })
  );

  transformers.forEach(
    (
      transformer // Update all the centroid layers
    ) =>
      transformer[2].setSharedVar("result", {
        centroids,
      })
  );

  await Libra.createHistoryTrrack();
}

main();
