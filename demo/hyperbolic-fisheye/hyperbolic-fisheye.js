// Special thanks to algorithm from https://github.com/moderneinc/walrus/blob/master/src/main/java/org/caida/walrus/H3GraphLayout.java#L158

function layoutHyperbolic(edges, vertices) {
  const retval = {
    radius: Array(vertices.length).fill(0),
    theta: Array(vertices.length).fill(0),
    phi: Array(vertices.length).fill(0),
  };
  const graph = { edges, vertices };

  computeRadii(graph, retval);
  computeAngles(graph, retval);
}

function computeRadii(graph, layout) {
  computeRadiiSubtree(
    graph,
    layout,
    graph.vertices.reduce((p, v) => (p.degree < v.degree ? v : p))
  );
}

function computeRadiiSubtree(graph, layout, node) {
  
}

function computeAngles(graph, layout) {
  computeAnglesSubtree(
    graph,
    graph.vertices.reduce((p, v) => (p.degree < v.degree ? v : p)),
    0
  );
}

function computeAnglesSubtree(graph, node, level) {}
