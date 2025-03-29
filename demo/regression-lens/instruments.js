Instrument.register("BrushInstrument2", {
  constructor: Instrument,
  interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
  on: {
    dragstart: [
      ({ event, layer, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        const mainLayer = instrument.getSharedVar("mainLayer", {
          defaultValue: layer,
        });

        mainLayer.services.find("SelectionService").forEach((service) => {
          service.setSharedVar("x", event.clientX, { layer: mainLayer });
          service.setSharedVar("y", event.clientY, { layer: mainLayer });
          service.setSharedVar("width", 1, { layer: mainLayer });
          service.setSharedVar("height", 1, { layer: mainLayer });
          service.setSharedVar("startx", event.clientX, { layer: mainLayer });
          service.setSharedVar("starty", event.clientY, { layer: mainLayer });
          service.setSharedVar("currentx", event.clientX, { layer: mainLayer });
          service.setSharedVar("currenty", event.clientY, { layer: mainLayer });
          const transientLayer = layer.getSiblingLayer("transientLayer");
          transientLayer.getGraphic().innerHTML = "";
        });
        instrument.setSharedVar("startx", event.clientX);
        instrument.setSharedVar("starty", event.clientY);
        
      },
    ],
    drag: [
      ({ event, layer, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        const mainLayer = instrument.getSharedVar("mainLayer", {
          defaultValue: layer,
        });
        mainLayer.services.find("SelectionService").forEach((service) => {
          const startx = service.getSharedVar("startx", { layer: mainLayer });
          const starty = service.getSharedVar("starty", { layer: mainLayer });
          service.setSharedVar("x", Math.min(event.clientX, startx), {
            layer: mainLayer,
          });
          service.setSharedVar("y", Math.min(event.clientY, starty), {
            layer: mainLayer,
          });
          service.setSharedVar("width", Math.abs(event.clientX - startx), {
            layer: mainLayer,
          });
          service.setSharedVar("height", Math.abs(event.clientY - starty), {
            layer: mainLayer,
          });
          service.setSharedVar("currentx", event.clientX, { layer: mainLayer });
          service.setSharedVar("currenty", event.clientY, { layer: mainLayer });
        });
        const startx = instrument.getSharedVar("startx");
        const starty = instrument.getSharedVar("starty");
        const baseBBox = (
          layer.getGraphic().querySelector(".ig-layer-background") ||
          layer.getGraphic()
        ).getBoundingClientRect();
        const transientLayer = layer.getSiblingLayer("transientLayer");
        transientLayer.getGraphic().innerHTML = `<rect x=${
          Math.min(event.clientX, startx) - baseBBox.x
        } y=${Math.min(event.clientY, starty) - baseBBox.y} width=${Math.abs(
          event.clientX - startx
        )} height=${Math.abs(
          event.clientY - starty
        )} class="transientRect" fill="#000" opacity="0.3" />`;
      },
    ],
    dragend: [
      ({ event, layer, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        const mainLayer = instrument.getSharedVar("mainLayer", {
          defaultValue: layer,
        });
        mainLayer.services.find("SelectionService").forEach((service) => {
          service.setSharedVar("currentx", event.clientX, { layer: mainLayer });
          service.setSharedVar("currenty", event.clientY, { layer: mainLayer });
          service.setSharedVar("endx", event.clientX, { layer: mainLayer });
          service.setSharedVar("endy", event.clientY, { layer: mainLayer });
        });
      },
    ],
    dragabort: [
      ({ event, layer }) => {
        // if (event.changedTouches) event = event.changedTouches[0];
        // const mainLayer = instrument.getSharedVar("mainLayer", {defaultValue: layer})
        // mainLayer.services.find("SelectionService").forEach((service) => {
        //   service.setSharedVar("x", 0, { layer: mainLayer });
        //   service.setSharedVar("y", 0, { layer: mainLayer });
        //   service.setSharedVar("width", 0, { layer: mainLayer });
        //   service.setSharedVar("height", 0, { layer: mainLayer });
        //   service.setSharedVar("currentx", event.clientX, { layer: mainLayer });
        //   service.setSharedVar("currenty", event.clientY, { layer: mainLayer });
        //   service.setSharedVar("endx", event.clientX, { layer: mainLayer });
        //   service.setSharedVar("endy", event.clientY, { layer: mainLayer });
        // });
        // const transientLayer = layer.getSiblingLayer("transientLayer");
        // transientLayer.getGraphic().innerHTML = "";
      },
    ],
  },
  preAttach: (instrument, layer) => {
    // Create default SM on layer
    const mainLayer = instrument.getSharedVar("mainLayer", {
      defaultValue: layer,
    });
    mainLayer.services.find("SelectionService", "RectSelectionService");
  },
});

Instrument.register("DataBrushInstrument2", {
  constructor: Instrument,
  interactors: ["MouseTraceInteractor", "TouchTraceInteractor"],
  on: {
    dragstart: [
      ({ event, layer }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        layer.services.find("SelectionService").forEach((service) => {
          service.setSharedVar("x", event.clientX, { layer });
          service.setSharedVar("y", event.clientY, { layer });
          service.setSharedVar("width", 1, { layer });
          service.setSharedVar("height", 1, { layer });
          service.setSharedVar("startx", event.clientX, { layer });
          service.setSharedVar("starty", event.clientY, { layer });
          service.setSharedVar("currentx", event.clientX, { layer });
          service.setSharedVar("currenty", event.clientY, { layer });
          service.setSharedVar(
            "attrNameX",
            layer.getSharedVar(
              "fieldX",
              service.getSharedVar("attrNameX", { layer })
            ),
            { layer }
          );
          service.setSharedVar(
            "attrNameY",
            layer.getSharedVar(
              "fieldY",
              service.getSharedVar("attrNameY", { layer })
            ),
            { layer }
          );
          service.setSharedVar("extentX", [0, 0], { layer });
          service.setSharedVar("extentY", [0, 0], { layer });
        });
        const transientLayer = layer.getSiblingLayer("transientLayer");
        transientLayer.getGraphic().innerHTML = "";
      },
    ],
    drag: [
      ({ event, layer }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        layer.services.find("SelectionService").forEach((service) => {
          const baseBBox = (
            layer.getGraphic().querySelector(".ig-layer-background") ||
            layer.getGraphic()
          ).getBoundingClientRect();
          const startx = service.getSharedVar("startx", { layer });
          const starty = service.getSharedVar("starty", { layer });
          service.setSharedVar("x", Math.min(event.clientX, startx), { layer });
          service.setSharedVar("y", Math.min(event.clientY, starty), { layer });
          service.setSharedVar("width", Math.abs(event.clientX - startx), {
            layer,
          });
          service.setSharedVar("height", Math.abs(event.clientY - starty), {
            layer,
          });
          const sx = layer.getSharedVar("scaleX");
          const sy = layer.getSharedVar("scaleY");
          service.setSharedVar(
            "extentX",
            [event.clientX, startx]
              .map((x) => layer.getSharedVar("scaleX").invert(x - baseBBox.x))
              .sort((a, b) => a - b),
            { layer }
          );
          service.setSharedVar(
            "extentY",
            [event.clientY, starty]
              .map((y) => layer.getSharedVar("scaleY").invert(y - baseBBox.y))
              .sort((a, b) => a - b),
            { layer }
          );
          service.setSharedVar("currentx", event.clientX, { layer });
          service.setSharedVar("currenty", event.clientY, { layer });
          const transientLayer = layer.getSiblingLayer("transientLayer");
          transientLayer.getGraphic().innerHTML = `<rect x=${
            Math.min(event.clientX, startx) - baseBBox.x
          } y=${Math.min(event.clientY, starty) - baseBBox.y} width=${Math.abs(
            event.clientX - startx
          )} height=${Math.abs(
            event.clientY - starty
          )} class="transientRect" fill="#000" opacity="0.3" />`;
        });
      },
    ],
    dragend: [
      ({ event, layer, instrument }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        layer.services.find("SelectionService").forEach((service) => {
          // service.setSharedVar("x", 0, {layer});
          // service.setSharedVar("y", 0, {layer});
          // service.setSharedVar("width", 0, {layer});z
          // service.setSharedVar("height", 0, {layer});
          service.setSharedVar("currentx", event.clientX, { layer });
          service.setSharedVar("currenty", event.clientY, { layer });
          service.setSharedVar("endx", event.clientX, { layer });
          service.setSharedVar("endy", event.clientY, { layer });
        });
      },
    ],
    dragabort: [
      ({ event, layer }) => {
        if (event.changedTouches) event = event.changedTouches[0];
        layer.services.find("SelectionService").forEach((service) => {
          service.setSharedVar("x", 0, { layer });
          service.setSharedVar("y", 0, { layer });
          service.setSharedVar("width", 0, { layer });
          service.setSharedVar("height", 0, { layer });
          service.setSharedVar("currentx", event.clientX, { layer });
          service.setSharedVar("currenty", event.clientY, { layer });
          service.setSharedVar("endx", event.clientX, { layer });
          service.setSharedVar("endy", event.clientY, { layer });
          service.setSharedVar("extentX", undefined, { layer });
          service.setSharedVar("extentY", undefined, { layer });
        });
        const transientLayer = layer.getSiblingLayer("transientLayer");
        transientLayer.getGraphic().innerHTML = "";
      },
    ],
  },
  preAttach: (instrument, layer) => {
    // Create default SM on layer
    layer.services.find("SelectionService", "RectSelectionService");
  },
});