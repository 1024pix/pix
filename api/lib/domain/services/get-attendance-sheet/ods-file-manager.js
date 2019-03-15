const util = require('util');
const fs = require('fs');
const JSZip = require('jszip');

const CONTENT_XML_IN_ODS = 'content.xml';

module.exports = {
  readODSFile,
  writeODSFile,
};

async function readODSFile({ odsFilePath }) {
  const zip = await _loadOdsTemplate(odsFilePath);
  const contentXmlBufferCompressed = zip.file(CONTENT_XML_IN_ODS);
  const uncompressedBuffer = await contentXmlBufferCompressed.async('nodebuffer');
  return Buffer.from(uncompressedBuffer, 'utf8').toString();
}

async function writeODSFile({ stringifiedXml, odsFilePath }) {
  const zip = await _loadOdsTemplate(odsFilePath);
  await zip.file(CONTENT_XML_IN_ODS, stringifiedXml);
  const odsBuffer = await zip.generateAsync({ type: 'nodebuffer' });

  return odsBuffer;
}

async function _loadOdsTemplate(odsFilePath) {
  const odsFileData = await _openOdsFile(odsFilePath);
  const zip = JSZip();
  return await zip.loadAsync(odsFileData);
}

async function _openOdsFile(odsFilePath) {
  return await util.promisify(fs.readFile)(odsFilePath);
}
