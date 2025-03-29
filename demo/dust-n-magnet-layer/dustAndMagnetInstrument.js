const helper = require("./helper");
const { Instrument, SelectionService, Interactor } = Libra;

const trajectoryInteractor = Interactor.initialize("TrajectoryInteractor");
const pointSelectionService = SelectionService.initialize(
  "PointSelectionService"
);

Instrument.unregister("DustAndMagnetInstrument");
Instrument.register("DustAndMagnetInstrument", {
  props: {
    magnetClassName: "magnet",
    //dustClassName: "dust",
    dustElems: [],
    dustDataAccessor: (dustElem) => d3.select(dustElem).datum(), // {[property: string]: number}
    magnetDataAccessor: (magnetElem) => d3.select(magnetElem).datum()  // {property, min, max}
  },
  selectionService: pointSelectionService,
  relations: [
    {
      attribute: ["x", "y"],
      interactor: trajectoryInteractor,
      startCommand: (e) => [e.x, e.y],
      dragCommand: (e) => [e.x, e.y],
    },
  ],
  startCommands: [
    function (sm, e, layers) {
      const layer = layers[0];
      layer.setSharedVar("pre", [e.x, e.y]);
    },
    function (sm, e, layers) {
      const {result} = sm;
      const magnetClassName = this.prop("magnetClassName");
      const layer = layers[0];
      const pos = d3.pointer(e.rawEvent, document.documentElement);
      const elems = document.elementsFromPoint(pos[0], pos[1]);
      let magnet = null;
      for (const elem of elems) {
        if (!elem.parentElement) break; //continue;
        const classList = elem.parentElement.classList; //elem: rect, parent: g
        if (classList.contains(magnetClassName)) {
          magnet = elem.parentElement;
          layer.setSharedVar("magnet", elem.parentElement);
          break;
        }
      }
    },
  ],
  dragCommand: function (sm, e, layers) {
    const layer = layers[0];
    const pre = layer.getSharedVar("pre");
    layer.setSharedVar("offset", [e.x - pre[0], e.y - pre[1]]);
    layer.setSharedVar("pre", [e.x, e.y]);
  },
  dragFeedbacks: [
    // move magnet
    function (sm, e, layers) {
      const layer = layers[0];
      const magnet = layer.getSharedVar("magnet");
      const offset = layer.getSharedVar("offset");
      const xy = helper.getXYfromTransform(d3.select(magnet));
      d3.select(magnet).attr(
        "transform",
        `translate(${xy[0] + offset[0]}, ${xy[1] + offset[1]})`
      );
    },
    // attract dusts
    function (sm, e, layers) {
      const layer = layers[0];
      const dustClassName = this.prop("dustClassName");
      const magnetClassName = this.prop("magnetClassName");
      const dustDataAccessor = this.prop("dustDataAccessor");
      const magnetDataAccessor = this.prop("magnetDataAccessor");
      const dustElems = this.prop("dustElems");
      //const dustElems = layer.query(`.${dustClassName}`);
      const magnetElems = layer.query(`.${magnetClassName}`);

      const time = 1;
      const magnitude = 1;
      for (const dustElem of dustElems) {
        const dust = d3.select(dustElem);
        const dustX = +dust.attr("cx");
        const dustY = +dust.attr("cy");
        
        let vxAcc = 0;
        let vyAcc = 0;
        for (const magnet of magnetElems) {
          let [x, y] = helper.getXYfromTransform(d3.select(magnet));
          x -= +magnet.getAttribute("width");
          y -= +magnet.getAttribute("height");
          // todo: data accessor
          const {property, min, max} = magnetDataAccessor(magnet); 
          

          const range = max - min;
          if (range === 0) continue;
          const value = dustDataAccessor(dustElem)[property];
          const velocity = (magnitude * (value - min)) / range;
          const [velocityX, velocityY] = resolveVelocity(
            velocity,
            [x, y],
            [dustX, dustY]
          );
          vxAcc += velocityX;
          vyAcc += velocityY;
        }
        dust.attr("cx", dustX + vxAcc * time);
        dust.attr("cy", dustY + vyAcc * time);
      }
    },
  ],
  endCommand: function (sm, e, layers) {
    const layer = layers[0];
    layer.setSharedVar("magnet", null);
  },
});


function resolveVelocity(velocity, magnetPos, dustPos) {
  const xDistance = magnetPos[0] - dustPos[0];
  const yDistance = magnetPos[1] - dustPos[1];
  const hypo = Math.sqrt(xDistance ** 2 + yDistance ** 2);
  const xVelocity = (xDistance / hypo) * velocity;
  const yVelocity = (yDistance / hypo) * velocity;
  return [xVelocity, yVelocity];
}
