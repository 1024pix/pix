import JSZip from 'jszip';
import fs from 'fs';

const { promises } = fs;

async function loadOdsZip(odsFilePath) {
  const odsFileData = await _openOdsFile(odsFilePath);
  const zip = JSZip();
  return zip.loadAsync(odsFileData);
}

function _openOdsFile(odsFilePath) {
  return fs.readFile(odsFilePath);
}

export { loadOdsZip };
