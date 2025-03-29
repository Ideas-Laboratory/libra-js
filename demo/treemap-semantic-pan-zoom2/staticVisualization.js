// staticVisualization.js

globalThis.MARGIN = { top: 40, right: 40, bottom: 40, left: 40 };
globalThis.WIDTH = 1000 - globalThis.MARGIN.left - globalThis.MARGIN.right;
globalThis.HEIGHT = 800 - globalThis.MARGIN.top - globalThis.MARGIN.bottom;

globalThis.data = null;
globalThis.nodes = null;
globalThis.links = null;

async function loadData() {
  globalThis.data = await d3.json("./data/enterprise-it-architecture.json");

  const nodes = [];
  const links = globalThis.data.links;

  function processNode(node, depth = 0, parent = null) {
    const newNode = {
      id: node.id || node.name,
      name: node.name,
      type: node.type,
      depth: depth,
      parent: parent,
      children: [],
    };
    nodes.push(newNode);

    if (node.children) {
      node.children.forEach((child) => {
        const childNode = processNode(child, depth + 1, newNode);
        newNode.children.push(childNode.id);
      });
    }
    return newNode;
  }

  processNode(globalThis.data.nodes[0]);

  // Position nodes to avoid collisions
  const depthCounts = {};
  nodes.forEach((node) => {
    depthCounts[node.depth] = (depthCounts[node.depth] || 0) + 1;
  });

  nodes.forEach((node) => {
    const totalAtDepth = depthCounts[node.depth];
    const index = nodes.filter((n) => n.depth === node.depth).indexOf(node);
    const siblingCount = node.parent?.children.length ?? 1;
    const siblingIndex =
      (node.parent?.children ?? [node.id]).findIndex((n) => n == node.id) + 1;
    node.x = ((index + 0.5) / totalAtDepth) * globalThis.WIDTH;
    node.y = (globalThis.HEIGHT / siblingCount) * (siblingIndex - 0.5);
  });

  nodes.push({
    id: "obj",
    name: "对象",
    type: 3,
    depth: 2,
    parent: null,
    children: [],
    x: (globalThis.WIDTH / 8) * 3.5,
    y: (globalThis.HEIGHT / 4) * 1,
  });

  // Create parent links
  const parentLinks = [];
  links.forEach((link) => {
    let sourceNode = nodes.find((n) => n.id === link.source);
    let targetNode = nodes.find((n) => n.id === link.target);
    while (sourceNode && targetNode && sourceNode.depth !== targetNode.depth) {
      if (sourceNode.depth > targetNode.depth) {
        sourceNode = nodes.find((n) => n.id === sourceNode.parent.id);
      } else {
        targetNode = nodes.find((n) => n.id === targetNode.parent.id);
      }
    }
    while (sourceNode && targetNode && sourceNode.id !== targetNode.id) {
      const existingParentLink = parentLinks.find(
        (p) => p.source == sourceNode.id && p.target == targetNode.id
      );
      if (existingParentLink) {
        existingParentLink.value++;
      } else {
        parentLinks.push({
          source: sourceNode.id,
          target: targetNode.id,
          value: link.value,
        });
      }
      sourceNode = nodes.find((n) => n.id === sourceNode.parent?.id);
      targetNode = nodes.find((n) => n.id === targetNode.parent?.id);
      if (
        sourceNode &&
        targetNode &&
        targetNode.id === "业务中心" &&
        sourceNode.id.includes("模块")
      ) {
        targetNode = nodes.find((n) => n.id === "obj");
      }
    }
  });
  parentLinks.push({
    source: "obj",
    target: "业务中心",
    value: 3,
  });

  globalThis.nodes = nodes;
  globalThis.links = parentLinks;

  globalThis.data_detail_level1 = nodes.filter((n) => n.depth === 0);
  globalThis.data_detail_level2 = nodes.filter((n) => n.depth === 1);
  globalThis.data_detail_level3 = nodes.filter((n) => n.depth === 2);
}

function renderStaticVisualization() {
  d3.select(".el-main").style("background", "white");

  const svg = d3
    .select("#LibraPlayground")
    .append("svg")
    .attr(
      "width",
      globalThis.WIDTH + globalThis.MARGIN.left + globalThis.MARGIN.right
    )
    .attr(
      "height",
      globalThis.HEIGHT + globalThis.MARGIN.top + globalThis.MARGIN.bottom
    )
    .append("g")
    .attr(
      "transform",
      `translate(${globalThis.MARGIN.left},${globalThis.MARGIN.top})`
    );

  globalThis.x = d3
    .scaleLinear()
    .domain([0, globalThis.WIDTH])
    .range([0, globalThis.WIDTH]);
  globalThis.y = d3
    .scaleLinear()
    .domain([0, globalThis.HEIGHT])
    .range([0, globalThis.HEIGHT]);
}

module.exports = {
  loadData,
  renderStaticVisualization,
};
