// global variables
globalThis.vegaSpec = {};
globalThis.x = {};

async function loadData() {
  globalThis.data = await d3.json("data/flights-200k.json");

  globalThis.vegaSpec = {
    $schema: "https://vega.github.io/schema/vega/v5.json",
    description:
      "Interactive cross-filtering among histograms of flight statistics.",
    width: 500,
    padding: 5,

    signals: [
      { name: "chartHeight", value: 100 },
      { name: "chartPadding", value: 50 },
      { name: "height", update: "(chartHeight + chartPadding) * 3" },
      { name: "delayExtent", value: [-60, 180] },
      { name: "timeExtent", value: [0, 24] },
      { name: "distExtent", value: [0, 2400] },
      {
        name: "delayStep",
        value: 10,
        bind: { input: "range", min: 2, max: 20, step: 1 },
      },
      {
        name: "timeStep",
        value: 1,
        bind: { input: "range", min: 0.25, max: 2, step: 0.25 },
      },
      {
        name: "distStep",
        value: 100,
        bind: { input: "range", min: 50, max: 200, step: 50 },
      },
    ],

    data: [
      {
        name: "flights",
        values: globalThis.data,
        transform: [
          {
            type: "bin",
            field: "delay",
            extent: { signal: "delayExtent" },
            step: { signal: "delayStep" },
            as: ["delay0", "delay1"],
          },
          {
            type: "bin",
            field: "time",
            extent: { signal: "timeExtent" },
            step: { signal: "timeStep" },
            as: ["time0", "time1"],
          },
          {
            type: "bin",
            field: "distance",
            extent: { signal: "distExtent" },
            step: { signal: "distStep" },
            as: ["dist0", "dist1"],
          },
        ],
      },
      {
        name: "filtered",
        values: [],
        transform: [
          {
            type: "bin",
            field: "delay",
            extent: { signal: "delayExtent" },
            step: { signal: "delayStep" },
            as: ["delay0", "delay1"],
          },
          {
            type: "bin",
            field: "time",
            extent: { signal: "timeExtent" },
            step: { signal: "timeStep" },
            as: ["time0", "time1"],
          },
          {
            type: "bin",
            field: "distance",
            extent: { signal: "distExtent" },
            step: { signal: "distStep" },
            as: ["dist0", "dist1"],
          },
        ],
      },
    ],

    scales: [
      {
        name: "layout",
        type: "band",
        domain: ["delay", "time", "distance"],
        range: "height",
      },
      {
        name: "delayScale",
        type: "linear",
        round: true,
        domain: { signal: "delayExtent" },
        range: "width",
      },
      {
        name: "timeScale",
        type: "linear",
        round: true,
        domain: { signal: "timeExtent" },
        range: "width",
      },
      {
        name: "distScale",
        type: "linear",
        round: true,
        domain: { signal: "distExtent" },
        range: "width",
      },
    ],

    marks: [
      {
        description: "Delay Histogram",
        name: "delay",
        type: "group",
        encode: {
          enter: {
            y: { scale: "layout", value: "delay", offset: 20 },
            width: { signal: "width" },
            height: { signal: "chartHeight" },
            fill: { value: "transparent" },
          },
        },

        data: [
          {
            name: "delay-bins",
            source: "flights",
            transform: [
              {
                type: "aggregate",
                groupby: ["delay0", "delay1"],
                key: "delay0",
                drop: false,
              },
            ],
          },
          {
            name: "delay-filtered-bins",
            source: "filtered",
            transform: [
              {
                type: "aggregate",
                groupby: ["delay0", "delay1"],
                key: "delay0",
                drop: false,
              },
            ],
          },
        ],

        scales: [
          {
            name: "yscale",
            type: "linear",
            domain: { data: "delay-bins", field: "count" },
            range: [{ signal: "chartHeight" }, 0],
          },
        ],

        axes: [{ orient: "bottom", scale: "delayScale" }],

        marks: [
          {
            name: "delay-bars",
            type: "rect",
            from: { data: "delay-bins" },
            encode: {
              enter: {
                fill: { value: "gray" },
              },
              update: {
                x: { scale: "delayScale", field: "delay0" },
                x2: { scale: "delayScale", field: "delay1", offset: -1 },
                y: { scale: "yscale", field: "count" },
                y2: { scale: "yscale", value: 0 },
              },
            },
          },
          {
            type: "rect",
            from: { data: "delay-filtered-bins" },
            encode: {
              enter: {
                fill: { value: "steelblue" },
              },
              update: {
                x: { scale: "delayScale", field: "delay0" },
                x2: { scale: "delayScale", field: "delay1", offset: -1 },
                y: { scale: "yscale", field: "count" },
                y2: { scale: "yscale", value: 0 },
              },
            },
          },
          {
            type: "text",
            interactive: false,
            encode: {
              enter: {
                y: { value: -5 },
                text: { value: "Arrival Delay (min)" },
                baseline: { value: "bottom" },
                fontSize: { value: 14 },
                fontWeight: { value: 500 },
                fill: { value: "black" },
              },
            },
          },
        ],
      },

      {
        description: "Time Histogram",
        name: "time",
        type: "group",
        encode: {
          enter: {
            y: { scale: "layout", value: "time", offset: 20 },
            width: { signal: "width" },
            height: { signal: "chartHeight" },
            fill: { value: "transparent" },
          },
        },

        data: [
          {
            name: "time-bins",
            source: "flights",
            transform: [
              {
                type: "aggregate",
                groupby: ["time0", "time1"],
                key: "time0",
                drop: false,
              },
            ],
          },
          {
            name: "time-filtered-bins",
            source: "filtered",
            transform: [
              {
                type: "aggregate",
                groupby: ["time0", "time1"],
                key: "time0",
                drop: false,
              },
            ],
          },
        ],

        scales: [
          {
            name: "yscale",
            type: "linear",
            domain: { data: "time-bins", field: "count" },
            range: [{ signal: "chartHeight" }, 0],
          },
        ],

        axes: [{ orient: "bottom", scale: "timeScale" }],

        marks: [
          {
            name: "time-bars",
            type: "rect",
            from: { data: "time-bins" },
            encode: {
              enter: {
                fill: { value: "gray" },
              },
              update: {
                x: { scale: "timeScale", field: "time0" },
                x2: { scale: "timeScale", field: "time1", offset: -1 },
                y: { scale: "yscale", field: "count" },
                y2: { scale: "yscale", value: 0 },
              },
            },
          },
          {
            type: "rect",
            from: { data: "time-filtered-bins" },
            encode: {
              enter: {
                fill: { value: "steelblue" },
              },
              update: {
                x: { scale: "timeScale", field: "time0" },
                x2: { scale: "timeScale", field: "time1", offset: -1 },
                y: { scale: "yscale", field: "count" },
                y2: { scale: "yscale", value: 0 },
              },
            },
          },
          {
            type: "text",
            interactive: false,
            encode: {
              enter: {
                y: { value: -5 },
                text: { value: "Local Departure Time (hour)" },
                baseline: { value: "bottom" },
                fontSize: { value: 14 },
                fontWeight: { value: 500 },
                fill: { value: "black" },
              },
            },
          },
        ],
      },

      {
        description: "Distance Histogram",
        name: "distance",
        type: "group",
        encode: {
          enter: {
            y: { scale: "layout", value: "distance", offset: 20 },
            width: { signal: "width" },
            height: { signal: "chartHeight" },
            fill: { value: "transparent" },
          },
        },

        data: [
          {
            name: "distance-bars",
            name: "distance-bins",
            source: "flights",
            transform: [
              {
                type: "aggregate",
                groupby: ["dist0", "dist1"],
                key: "dist0",
                drop: false,
              },
            ],
          },
          {
            name: "distance-filtered-bins",
            source: "filtered",
            transform: [
              {
                type: "aggregate",
                groupby: ["dist0", "dist1"],
                key: "dist0",
                drop: false,
              },
            ],
          },
        ],

        scales: [
          {
            name: "yscale",
            type: "linear",
            domain: { data: "distance-bins", field: "count" },
            range: [{ signal: "chartHeight" }, 0],
          },
        ],

        axes: [{ orient: "bottom", scale: "distScale" }],

        marks: [
          {
            name: "distance-bars",
            type: "rect",
            from: { data: "distance-bins" },
            encode: {
              enter: {
                fill: { value: "gray" },
              },
              update: {
                x: { scale: "distScale", field: "dist0" },
                x2: { scale: "distScale", field: "dist1", offset: -1 },
                y: { scale: "yscale", field: "count" },
                y2: { scale: "yscale", value: 0 },
              },
            },
          },
          {
            type: "rect",
            from: { data: "distance-filtered-bins" },
            encode: {
              enter: {
                fill: { value: "steelblue" },
              },
              update: {
                x: { scale: "distScale", field: "dist0" },
                x2: { scale: "distScale", field: "dist1", offset: -1 },
                y: { scale: "yscale", field: "count" },
                y2: { scale: "yscale", value: 0 },
              },
            },
          },
          {
            type: "text",
            interactive: false,
            encode: {
              enter: {
                y: { value: -5 },
                text: { value: "Travel Distance (miles)" },
                baseline: { value: "bottom" },
                fontSize: { value: 14 },
                fontWeight: { value: 500 },
                fill: { value: "black" },
              },
            },
          },
        ],
      },
    ],
  };
}

async function renderStaticVisualization() {
  // render vega spec on screen
  const { view } = await vega(
    document.getElementById("LibraPlayground"),
    globalThis.vegaSpec
  );
  globalThis.vegaView = view;
  globalThis.x.delay = view.scale("delayScale");
  globalThis.x.distance = view.scale("distScale");
  globalThis.x.time = view.scale("timeScale");
}

module.exports = {
  loadData,
  renderStaticVisualization,
};
