const util = require('util');
const JSZip = require('jszip');
const fs = require('fs');

async function loadOdsZip(odsFilePath) {
  const odsFileData = await _openOdsFile(odsFilePath);
  const zip = JSZip();
  return zip.loadAsync(odsFileData);
}

function _openOdsFile(odsFilePath) {
  return util.promisify(fs.readFile)(odsFilePath);
}

module.exports = {
  loadOdsZip,
};
