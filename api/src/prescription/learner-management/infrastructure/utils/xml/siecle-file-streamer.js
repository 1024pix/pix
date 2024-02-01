import _ from 'lodash';

import { FileValidationError } from '../../../../../../lib/domain/errors.js';
import { SiecleXmlImportError } from '../../../domain/errors.js';
import { logErrorWithCorrelationIds } from '../../../../../../lib/infrastructure/monitoring-tools.js';
import fs from 'fs';

const fsPromises = fs.promises;
import buffer from 'buffer';

const { xmlEncoding } = xmlBufferTostring;

const { Buffer } = buffer;

import iconv from 'iconv-lite';
import sax from 'sax';
import xmlBufferTostring from 'xml-buffer-tostring';

import * as zip from '../zip/zip.js';

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
const DEFAULT_FILE_ENCODING = 'UTF-8';

class SiecleFileStreamer {
  static async create(path, logError = logErrorWithCorrelationIds) {
    const { file: filePath, directory } = await zip.unzip(path);
    const encoding = await _detectEncoding(filePath);

    let readableStream;
    try {
      readableStream = fs.createReadStream(filePath);
    } catch (error) {
      logError(error);
      throw new FileValidationError(ERRORS.INVALID_FILE);
    }
    readableStream.on('error', (err) => {
      logError(err);
      throw new FileValidationError(ERRORS.INVALID_FILE);
    });
    const stream = new SiecleFileStreamer(readableStream, encoding, directory, logError);
    return stream;
  }

  constructor(readableStream, encoding, directory, logError) {
    this.readableStream = readableStream;
    this.encoding = encoding;
    this.directory = directory;
    this.logError = logError;
  }

  async perform(callback) {
    await this._callbackAsPromise(callback);
  }

  async _callbackAsPromise(callback) {
    return new Promise((resolve, reject) => {
      const saxStream = _getSaxStream(this.readableStream, this.encoding, reject, this.logError);
      callback(saxStream, resolve, reject);
    });
  }

  async close() {
    if (this.directory) {
      await fsPromises.rm(this.directory, { recursive: true });
    }
  }
}
async function _detectEncoding(path) {
  const firstLine = await _readFirstLine(path);
  return xmlEncoding(Buffer.from(firstLine)) || DEFAULT_FILE_ENCODING;
}

async function _readFirstLine(path) {
  const buffer = Buffer.alloc(128);

  try {
    const file = await fsPromises.open(path);
    await file.read(buffer, 0, 128, 0);
    file.close();
  } catch (err) {
    logErrorWithCorrelationIds(err);
    throw new FileValidationError(ERRORS.INVALID_FILE);
  }

  return buffer;
}

function _getSaxStream(inputStream, encoding, reject, logError) {
  const decodeStream = getDecodingStream(encoding);
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

function getDecodingStream(encoding) {
  try {
    return iconv.decodeStream(encoding);
  } catch (err) {
    logErrorWithCorrelationIds(err);
    throw new SiecleXmlImportError(ERRORS.ENCODING_NOT_SUPPORTED);
  }
}

export { SiecleFileStreamer };
