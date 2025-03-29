// 
const path = require("path");
const fsPromises = require('fs/promises');
const papa = require("papaparse");
const { agnes } = require("ml-hclust");
const d3 = require("d3");

async function readFile(filePath) {
  const data = await fsPromises.readFile(filePath, "utf-8");
  const dataJSON = papa.parse(data).data;
  // const dataJSON = JSON.parse(data);
  return dataJSON;
}

async function writeFile(filename, data) {
  fsPromises.writeFile(path.resolve(__dirname, filename), data);
}

async function main(){
  const data = await readFile("./hclustering/bezdekIris.csv");
  const filteredData = data.slice(1).map(d => [d[0], d[2]]);
  const max0 = Math.max(...filteredData.map(d => d[0]));
  const min0 = Math.min(...filteredData.map(d => d[0]));
  const max1 = Math.max(...filteredData.map(d => d[1]));
  const min1 = Math.min(...filteredData.map(d => d[1]));
  const scaledData = filteredData.map(d => [(d[0]-min0)/(max0 - min0), (d[1]-min1)/(max1-min1)]);
  const tree = agnes(scaledData, {method: "ward"});
  writeFile("./result.json", JSON.stringify(tree));

  const root = d3.hierarchy(tree);
  writeFile("./result2.json", JSON.stringify(root));
}

module.exports = main;