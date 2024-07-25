import iconv from 'iconv-lite';
import _ from 'lodash';
import sax from 'sax';

import { logErrorWithCorrelationIds } from '../../../../../../lib/infrastructure/monitoring-tools.js';
import { FileValidationError } from '../../../../../shared/domain/errors.js';
import { SiecleXmlImportError } from '../../../domain/errors.js';

/*
  https://github.com/1024pix/pix/pull/3470#discussion_r707319744
  Démonstration et explication sur https://regex101.com/r/Z0V2s7/5
  On cherche 0 ou plusieurs fois un nom de répertoire (ne commençant pas par un point, se terminant par /),
  puis un nom de fichier ne commençant pas par un point et se terminant par .xml.
 */
const ERRORS = {
  INVALID_FILE: 'INVALID_FILE',
  ENCODING_NOT_SUPPORTED: 'ENCODING_NOT_SUPPORTED',
};

class SiecleFileStreamer {
  static async create(readableStream, encoding = 'utf-8', logError = logErrorWithCorrelationIds) {
    const stream = new SiecleFileStreamer(readableStream, encoding, logError);
    return stream;
  }

  constructor(readableStream, encoding, logError) {
    this.readableStream = readableStream;
    this.encoding = encoding;
    this.logError = logError;
  }

  async perform(callback) {
    if (this.readableStream.destroyed) throw new FileValidationError(ERRORS.INVALID_FILE);

    await this._callbackAsPromise(callback);
  }

  async _callbackAsPromise(callback) {
    return new Promise((resolve, reject) => {
      const saxStream = _getSaxStream(this.readableStream, this.encoding, reject, this.logError);
      callback(saxStream, resolve, reject);
    });
  }
  async close() {
    this.readableStream.destroy();
  }
}

function _getSaxStream(inputStream, encoding, reject, logError) {
  const decodeStream = _getDecodingStream(encoding);
  decodeStream.on('error', (err) => {
    logError(err);
    return reject(new FileValidationError(ERRORS.ENCODING_NOT_SUPPORTED));
  });

  const saxParser = sax.createStream(true);
  saxParser.on(
    'error',
    _.once((err) => {
      logError(err);
      reject(new FileValidationError(ERRORS.INVALID_FILE));
    }),
  );
  return inputStream.pipe(decodeStream).pipe(saxParser);
}

function _getDecodingStream(encoding) {
  try {
    return iconv.decodeStream(encoding);
  } catch (err) {
    logErrorWithCorrelationIds(err);
    throw new SiecleXmlImportError(ERRORS.ENCODING_NOT_SUPPORTED);
  }
}

export { SiecleFileStreamer };
