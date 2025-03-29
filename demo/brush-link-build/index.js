// import static visualization and global variables
const VIS = require("./staticVisualization");

async function main() {
  await VIS.loadData();
  VIS.renderStaticVisualization();
  const [histLayers, scatterLayer] = renderMainVisualization();
  mountInteraction(histLayers, scatterLayer);
}

function renderMainVisualization() {
  // append the svg object to the body of the page
  const svg = d3.select("#LibraPlayground svg");

  // create layers
  const histLayers = [];
  globalThis.histFields.forEach((field, i) => {
    const layer = Libra.Layer.initialize("D3Layer", {
      name: "mainLayer",
      width: globalThis.HIST_WIDTH,
      height: globalThis.HIST_HEIGHT,
      offset: {
        x: globalThis.MARGIN.left + globalThis.HIST_MARGIN.left,
        y:
          globalThis.MARGIN.top +
          globalThis.HIST_MARGIN.top +
          (globalThis.HIST_MARGIN.top +
            globalThis.HIST_MARGIN.bottom +
            globalThis.HIST_HEIGHT) *
            i,
      },
      container: svg.node(),
    });

    const g = d3.select(layer.getGraphic());
    const binnedData = globalThis.bin[field](globalThis.data);
    g.selectAll(".bar")
      .data(binnedData)
      .join("rect")
      .attr("class", "bar")
      .attr("fill", "gray")
      .attr("x", (_, i) => (globalThis.HIST_WIDTH / binnedData.length) * i)
      .attr("width", globalThis.HIST_WIDTH / binnedData.length)
      .attr("y", (d) => globalThis.HIST_HEIGHT - globalThis.y[field](d.length))
      .attr("height", (d) => globalThis.y[field](d.length));

    renderHistogram(layer, field);
    layer.setLayersOrder({ selectionLayer: -1 });

    histLayers.push(layer);
  });
  const scatterLayer = Libra.Layer.initialize("D3Layer", {
    name: "mainLayer",
    width: globalThis.SCATTER_WIDTH,
    height: globalThis.SCATTER_HEIGHT,
    offset: {
      x: globalThis.MARGIN.left + globalThis.SCATTER_MARGIN.left,
      y: globalThis.MARGIN.top + globalThis.SCATTER_MARGIN.top,
    },
    container: svg.node(),
  });

  const g = d3.select(scatterLayer.getGraphic());
  g.selectAll("circle")
    .data(globalThis.data)
    .join("circle")
    .attr("stroke", "gray")
    .attr("fill", "none")
    .attr("r", 5)
    .attr("cx", (d) =>
      globalThis.x[globalThis.scatterFieldX](d[globalThis.scatterFieldX])
    )
    .attr("cy", (d) =>
      globalThis.y[globalThis.scatterFieldY](d[globalThis.scatterFieldY])
    );

  scatterLayer.setLayersOrder({ selectionLayer: -1 });
  renderScatter(scatterLayer);

  return [histLayers, scatterLayer];
}

function renderHistogram(layer, field, data = globalThis.data) {
  const g = d3.select(layer.getLayerFromQueue("histLayer").getGraphic());
  g.selectChildren().remove();

  const binnedData = globalThis.bin[field](data);
  g.selectAll(".bar")
    .data(binnedData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("fill", "steelblue")
    .attr("x", (_, i) => (globalThis.HIST_WIDTH / binnedData.length) * i)
    .attr("width", globalThis.HIST_WIDTH / binnedData.length)
    .attr("y", (d) => globalThis.HIST_HEIGHT - globalThis.y[field](d.length))
    .attr("height", (d) => globalThis.y[field](d.length));
}

function renderScatter(layer, data = globalThis.data) {
  const g = d3.select(layer.getLayerFromQueue("scatterLayer").getGraphic());
  g.selectChildren().remove();

  g.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("fill", "none")
    .attr("r", 5)
    .attr("stroke", (d) => globalThis.color(d[globalThis.scatterFieldColor]))
    .attr("cx", (d) =>
      globalThis.x[globalThis.scatterFieldX](d[globalThis.scatterFieldX])
    )
    .attr("cy", (d) =>
      globalThis.y[globalThis.scatterFieldY](d[globalThis.scatterFieldY])
    );
}

function mountInteraction(histLayers, scatterLayer) {
  // Initialize transformers
  const transformers = globalThis.histFields.map((field, i) => {
    const layer = histLayers[i];
    return Libra.GraphicalTransformer.initialize("RenderHistogram", {
      layer,
      sharedVar: { data: globalThis.data },
      redraw({ transformer, layer }) {
        const data = transformer.getSharedVar("data");
        renderHistogram(layer, field, data);
      },
    });
  });
  transformers.push(
    Libra.GraphicalTransformer.initialize("RenderScatter", {
      layer: scatterLayer,
      sharedVar: { data: globalThis.data },
      redraw({ transformer, layer }) {
        const data = transformer.getSharedVar("data");
        renderScatter(layer, data);
      },
    })
  );

  const commonChain = [
    {
      comp: "AnalysisService",
      resultAlias: "data",
      evaluate({ extents }) {
        let data = globalThis.data;
        if (!extents) return data;
        Object.entries(extents).forEach(([field, extent]) => {
          if (extent[0] >= extent[1] || isNaN(extent[0]) || isNaN(extent[1]))
            return;
          data = data.filter(
            (d) => d[field] >= extent[0] && d[field] <= extent[1]
          );
        });
        return data;
      },
    },
    transformers,
  ];

  const commonRemove = [
    {
      find: "SelectionService",
      cascade: true
    }
  ]

  Libra.Interaction.build({
    inherit: "BrushInstrument",
    layers: [scatterLayer],
    remove: commonRemove,
    insert: [
      {
        find: "BrushInstrument",
        flow: [
          {
            name: "CrossfilterService",
            comp: "QuantitativeSelectionService",
            dimension: [globalThis.scatterFieldX, globalThis.scatterFieldY],
            sharedVar: {
              scaleX: globalThis.x[globalThis.scatterFieldX],
              scaleY: globalThis.y[globalThis.scatterFieldY],
            },
          },
          ...commonChain,
        ],
      },
    ],
  });

  Libra.Interaction.build({
    inherit: "BrushXInstrument",
    layers: histLayers,
    remove: commonRemove,
    insert: [
      {
        find: "BrushXInstrument",
        flow: [
          (layer, i) => ({
            name: "CrossfilterService",
            comp: "QuantitativeSelectionService",
            layers: [layer],
            dimension: globalThis.histFields[i],
            sharedVar: {
              scaleX: globalThis.x[globalThis.histFields[i]],
            },
          }),
          ...commonChain,
        ],
      },
    ],
  });
}

main();
