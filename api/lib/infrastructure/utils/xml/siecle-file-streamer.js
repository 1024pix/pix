const { isObject, values } = require('lodash');
const { FileValidationError, SiecleXmlImportError } = require('../../../domain/errors.js');
const { logErrorWithCorrelationIds } = require('../../monitoring-tools.js');
const fs = require('fs');
const fsPromises = fs.promises;
const Path = require('path');
const os = require('os');
const { Buffer } = require('buffer');
const StreamZip = require('node-stream-zip');
const FileType = require('file-type');
const iconv = require('iconv-lite');
const sax = require('sax');
const xmlEncoding = require('xml-buffer-tostring').xmlEncoding;
const _ = require('lodash');

/*
  https://github.com/1024pix/pix/pull/3470#discussion_r707319744
  Démonstration et explication sur https://regex101.com/r/Z0V2s7/5
  On cherche 0 ou plusieurs fois un nom de répertoire (ne commençant pas par un point, se terminant par /),
  puis un nom de fichier ne commençant pas par un point et se terminant par .xml.
 */
const VALID_FILE_NAME_REGEX = /^([^.][^/]*\/)*[^./][^/]*\.xml$/;
const ERRORS = {
  INVALID_FILE: 'INVALID_FILE',
  ENCODING_NOT_SUPPORTED: 'ENCODING_NOT_SUPPORTED',
};
const DEFAULT_FILE_ENCODING = 'UTF-8';
const ZIP = 'application/zip';

class SiecleFileStreamer {
  static async create(path, logError = logErrorWithCorrelationIds) {
    let filePath = path;
    let directory = undefined;
    if (await _isFileZipped(path)) {
      directory = await _createTempDir();
      filePath = await _unzipFile(directory, path);
    }
    const encoding = await _detectEncoding(filePath);
    const stream = new SiecleFileStreamer(filePath, encoding, directory, logError);
    return stream;
  }

  constructor(path, encoding, directory, logError) {
    this.path = path;
    this.encoding = encoding;
    this.directory = directory;
    this.logError = logError;
  }

  async perform(callback) {
    await this._callbackAsPromise(callback);
  }

  async _callbackAsPromise(callback) {
    return new Promise((resolve, reject) => {
      const saxStream = _getSaxStream(this.path, this.encoding, reject, this.logError);
      callback(saxStream, resolve, reject);
    });
  }

  async close() {
    if (this.directory) {
      await fsPromises.rm(this.directory, { recursive: true });
    }
  }
}

async function _isFileZipped(path) {
  const fileType = await FileType.fromFile(path);
  return isObject(fileType) && fileType.mime === ZIP;
}
function _createTempDir() {
  const tmpDir = os.tmpdir();
  const directory = Path.join(tmpDir, 'import-siecle-');
  return fsPromises.mkdtemp(directory);
}
async function _unzipFile(directory, path) {
  const extractedFileName = Path.join(directory, 'organization-learners.xml');
  const zip = new StreamZip.async({ file: path });
  const fileName = await _getFileToExtractName(zip);
  try {
    await zip.extract(fileName, extractedFileName);
  } catch (error) {
    throw new FileValidationError(ERRORS.INVALID_FILE);
  }
  await zip.close();
  return extractedFileName;
}

async function _getFileToExtractName(zipStream) {
  const entries = await zipStream.entries();
  const fileNames = values(entries).map((entry) => entry.name);
  const validFiles = fileNames.filter((name) => VALID_FILE_NAME_REGEX.test(name));
  if (validFiles.length != 1) {
    zipStream.close();
    logErrorWithCorrelationIds({ ERROR: ERRORS.INVALID_FILE, entries });
    throw new FileValidationError(ERRORS.INVALID_FILE);
  }
  return validFiles[0];
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

function _getSaxStream(path, encoding, reject, logError) {
  let inputStream;
  try {
    inputStream = fs.createReadStream(path);
  } catch (error) {
    reject(new FileValidationError(ERRORS.INVALID_FILE));
  }

  inputStream.on('error', (err) => {
    logError(err);
    return reject(new FileValidationError(ERRORS.INVALID_FILE));
  });

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
    })
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

module.exports = SiecleFileStreamer;
