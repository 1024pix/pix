import JSZip from 'jszip';
import * as fs from 'fs/promises';

async function loadOdsZip(odsFilePath) {
  const odsFileData = await _openOdsFile(odsFilePath);
  const zip = JSZip();
  return zip.loadAsync(odsFileData);
}

function _openOdsFile(odsFilePath) {
  return fs.readFile(odsFilePath);
}

export { loadOdsZip };
