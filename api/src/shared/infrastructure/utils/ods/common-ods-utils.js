import * as fs from 'node:fs/promises';

import JSZip from 'jszip';

async function loadOdsZip(odsFilePath) {
  const odsFileData = await _openOdsFile(odsFilePath);
  const zip = JSZip();
  return zip.loadAsync(odsFileData);
}

function _openOdsFile(odsFilePath) {
  return fs.readFile(odsFilePath);
}

export { loadOdsZip };
