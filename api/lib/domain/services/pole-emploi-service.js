const settings = require('../../config');

function generateLink(sending) {
  const host = settings.apiManager.url;
  const { dateEnvoi, idEnvoi } = sending;
  const cursor = generateCursor({ idEnvoi, dateEnvoi });
  return `${host}/pole-emploi/envois?curseur=${cursor}`;
}

function generateCursor(data) {
  const string = JSON.stringify(data);
  const buffer = new Buffer.from(string);
  return buffer.toString('base64');
}

function decodeCursor(strbase64) {
  if (!strbase64) return null;

  const buffer = new Buffer.from(strbase64, 'base64');
  const string = buffer.toString('ascii');
  return JSON.parse(string);
}

module.exports = { generateLink, generateCursor, decodeCursor };
