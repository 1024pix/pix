const JSZip = require('jszip');
const fs = require('node:fs').promises;

async function loadOdsZip(odsFilePath) {
  const odsFileData = await _openOdsFile(odsFilePath);
  const zip = JSZip();
  return zip.loadAsync(odsFileData);
}

function _openOdsFile(odsFilePath) {
  return fs.readFile(odsFilePath);
}

module.exports = {
  loadOdsZip,
};
