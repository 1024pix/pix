import JSZip from 'jszip';
import { promises as fs } from 'fs';

async function loadOdsZip(odsFilePath) {
  const odsFileData = await _openOdsFile(odsFilePath);
  const zip = JSZip();
  return zip.loadAsync(odsFileData);
}

function _openOdsFile(odsFilePath) {
  return fs.readFile(odsFilePath);
}

export default {
  loadOdsZip,
};
