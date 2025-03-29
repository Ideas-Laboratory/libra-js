require("./shiftSelectInteractor");
const { Instrument, Interactor, Service } = Libra;

const shiftSelectInteractor = Interactor.initialize("ShiftSelectInteractor");
//const nothingSelectionService = SelectionService.initialize("NothingSelectionService");
const pointSelectionService = Service.initialize(
  "PointSelectionService"
);
let i = 0;
Instrument.register("KMeansInstrument", {
  sharedVar: {
    data: [],
    centroids: [],
    fields: [],
    scatterLayer: null,
    scaleColor: null,
  },
  selectionService: pointSelectionService, //nothingSelectionService,
  relations: [
    {
      attribute: ["x", "y"],
      interactor: shiftSelectInteractor,
    },
  ],
  on: {
    start: function (sm, e, layers) {
      //
      const layer = layers[0];
      if (layer.getGraphic().getAttribute("tabIndex")) {
        layer.getGraphic().setAttribute("tabIndex", i++);
      }
      layer.getGraphic().focus();
      e.rawEvent.preventDefault();
    },
    end: function (sm, e, layers) {
      //
      const layer = layers[0];
      const fields = this.prop("fields");
      const scatterLayer = this.prop("scatterLayer");
      const scaleColor = this.prop("scaleColor");
      const centroids = layer.getSharedVar("centroids");
      const circles = d3.selectAll(
        scatterLayer
          .getObjects()
          .nodes()
          .filter((elem) => elem.tagName === "circle")
      );
      const data = circles.data().filter((d) => d);
      const { newCentroids, converged, iterations } = kMeansAdapter(
        data,
        centroids,
        fields
      );
      
      
      
      circles.attr("stroke", (d) => scaleColor(d.cluster));
      layer.setSharedVar("centroids", newCentroids); //JSON.parse(JSON.stringify(centroids)));
      layer.setSharedVar("data", data); // JSON.parse(JSON.stringify(centroids)));
    },
  },
});

function kMeansAdapter(data, centroids, fields) {
  const formatCentroids = centroidFormatter(centroids, fields);
  const formatData = dataFormatter(data, fields);

  const fieldExtents = fields.map((field) => [
    0,
    d3.max(data, (d) => d[field]),
  ]);
  const normalizers = fieldExtents.map((fe) =>
    d3.scaleLinear().domain(fe).range([0, 1])
  );
  const normalizedData = formatData.map((d) =>
    normalizers.map((normalizer, i) => normalizer(d[i]))
  );
  const normalizedCentroids = formatCentroids.map((c) =>
    normalizers.map((normalizer, i) => normalizer(c[i]))
  );

  const {
    clusters,
    centroids: resultCentroids,
    converged,
    iterations,
  } = kmeans(normalizedData, centroids.length, {
    initialization: normalizedCentroids,
  });
  data.forEach((d, i) => (d["cluster"] = clusters[i]));
  resultCentroids.forEach(
    (c) =>
      (c.centroid = normalizers.map((normalizer, i) =>
        normalizer.invert(c.centroid[i])
      ))
  );
  const newCentroids = reverseCentroidFormatter(resultCentroids, fields);
  return {
    data,
    newCentroids,
    converged,
    iterations,
  };
}

function dataFormatter(data, fields) {
  return data.map((d) => fields.map((f) => d[f]));
}

function centroidFormatter(centroids, fields) {
  return centroids.map((centroid) => fields.map((f) => centroid[f]));
}

function reverseCentroidFormatter(resultCentroids, fields) {
  const centroids = resultCentroids.map((c, cluster) =>
    Object.fromEntries(fields.map((f, i) => [f, c.centroid[i]]))
  );
  centroids.forEach((c, cluster) => (c["cluster"] = cluster));
  return centroids;
}
