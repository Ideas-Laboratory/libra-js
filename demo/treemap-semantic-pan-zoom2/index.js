// index.js

const VIS = require("./staticVisualization");

async function main() {
  await VIS.loadData();
  VIS.renderStaticVisualization();
  const [layer, transformer] = renderMainVisualization();
  mountInteraction(layer, transformer);
}

function renderMainVisualization(
  scaleX = globalThis.x,
  scaleY = globalThis.y,
  nodes = globalThis.data_detail_level1,
  links = globalThis.links
) {
  const svg = d3.select("#LibraPlayground svg");

  let g = svg.select(".main");
  let returnVal = null;
  if (g.empty()) {
    const mainLayer = Libra.Layer.initialize("D3Layer", {
      name: "mainLayer",
      width: globalThis.WIDTH,
      height: globalThis.HEIGHT,
      offset: { x: globalThis.MARGIN.left, y: globalThis.MARGIN.top },
      container: svg.node(),
    });
    g = d3.select(mainLayer.getGraphic());
    g.attr("class", "main");

    Libra.GraphicalTransformer.register("DrawGraph", {
      sharedVar: {
        scaleX: globalThis.x,
        scaleY: globalThis.y,
        nodes: globalThis.data_detail_level1,
        links: globalThis.links,
      },
      redraw({ transformer }) {
        const scaleX = transformer.getSharedVar("scaleX");
        const scaleY = transformer.getSharedVar("scaleY");
        const nodes = transformer.getSharedVar("nodes");
        const links = transformer.getSharedVar("links");
        renderMainVisualization(scaleX, scaleY, nodes, links);
      },
    });

    const transformer = Libra.GraphicalTransformer.initialize("DrawGraph", {
      layer: mainLayer,
    });

    returnVal = [mainLayer, transformer];
  }

  g.selectChildren().remove();

  // Draw links
  g.selectAll(".link")
    .data(links.filter(l => 
      nodes.find(n => n.id === l.source) && 
      nodes.find(n => n.id === l.target) &&
      l.source !== l.target
    ))
    .join("line")
    .attr("class", "link")
    .attr("x1", d => scaleX(nodes.find(n => n.id === d.source).x))
    .attr("y1", d => scaleY(nodes.find(n => n.id === d.source).y))
    .attr("x2", d => scaleX(nodes.find(n => n.id === d.target).x))
    .attr("y2", d => scaleY(nodes.find(n => n.id === d.target).y))
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .attr("stroke-width", d => d.value);

  // Draw nodes
  const nodeGroups = g.selectAll(".node")
    .data(nodes)
    .join("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${scaleX(d.x)},${scaleY(d.y)})`);

  nodeGroups.append("circle")
    .attr("r", 40)
    .attr("fill", d => d3.schemeCategory10[d.type % 10])
    .attr("stroke", "#fff")
    .attr("stroke-width", 0);

  nodeGroups.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", ".35em")
    .text(d => d.name)
    .call(wrap, 70);

  return returnVal;
}

// Function to wrap text
function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}

function mountInteraction(layer, transformer) {
  Libra.Interaction.build({
    inherit: "PanInstrument",
    layers: [layer],
    sharedVar: {
      fixRange: true,
      scaleX: globalThis.x,
      scaleY: globalThis.y,
    },
  });

  Libra.Interaction.build({
    inherit: "SemanticZoomInstrument",
    layers: [layer],
    sharedVar: {
      scaleLevels: {
        0: { nodes: globalThis.data_detail_level1, links: globalThis.links },
        3: { nodes: globalThis.data_detail_level2, links: globalThis.links },
        6: { nodes: globalThis.data_detail_level3, links: globalThis.links },
      },
      fixRange: true,
      scaleX: globalThis.x,
      scaleY: globalThis.y,
    },
  });
}

main();