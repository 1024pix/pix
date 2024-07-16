import { config } from '../../../src/shared/config.js';

function generateLink(sending, filters = {}) {
  const host = config.apiManager.url;
  const { dateEnvoi, idEnvoi } = sending;
  const cursor = generateCursor({ idEnvoi, dateEnvoi });
  let link = `${host}/pole-emploi/envois?curseur=${cursor}`;
  if (Object.keys(filters).includes('isSuccessful')) {
    link += `&enErreur=${!filters.isSuccessful}`;
  }
  return link;
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

export { decodeCursor, generateCursor, generateLink };
