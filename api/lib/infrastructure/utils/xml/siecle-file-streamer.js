const { noop } = require('lodash');
const { FileValidationError } = require('../../../domain/errors');
const fs = require('fs');
const readline = require('readline');
const Stream = require('stream');
const StreamZip = require('node-stream-zip');
const FileType = require('file-type');
const iconv = require('iconv-lite');
const sax = require('sax');
const xmlEncoding = require('xml-buffer-tostring').xmlEncoding;

const NO_STUDENTS_IMPORTED_FROM_INVALID_FILE = 'Aucun élève n’a pu être importé depuis ce fichier. Vérifiez que le fichier est conforme.';

const DEFAULT_FILE_ENCODING = 'UTF-8';
const ZIP = 'application/zip';
const BOM = '\uFEFF';
const BOM_LENGTH = 3;

class StreamPipe extends Stream.Transform {
  _transform(chunk, enc, cb) {
    this.push(chunk);
    cb();
  }
}

class StreamWithoutBOM extends Stream.Transform {
  _transform(chunk, enc, cb) {
    if (chunk.includes(BOM)) {
      const chunkWithoutBOM = removeBOM(chunk);
      this.push(chunkWithoutBOM);

    } else {
      this.push(chunk);
    }
    cb();
  }
}

function removeBOM(chunk) {
  return chunk.subarray(BOM_LENGTH);
}

function _unzippedStream(path) {
  const zip = new StreamZip({ file: path });
  const stream = new StreamPipe();
  zip.on('error', noop);
  zip.on('entry', (entry) => {
    zip.stream(entry, (err, stm) => {
      if (err) {
        throw new FileValidationError(NO_STUDENTS_IMPORTED_FROM_INVALID_FILE);
      } else if (!entry.name.includes('/')) {
        stm.on('error', noop);

        stm.pipe(stream);
      }
    });
  });
  return stream;
}

class SiecleFileStreamer {
  static async create(path) {
    const stream = new SiecleFileStreamer(path);
    await stream._detectEncoding();

    return stream;
  }

  constructor(path) {
    this.path = path;
  }

  async _detectEncoding() {
    const firstLine = await this._readFirstLine();
    this.encoding = xmlEncoding(Buffer.from(firstLine)) || DEFAULT_FILE_ENCODING;
  }

  async _getStream() {
    this.stream = await this._getRawStream();
    const saxParser = sax.createStream(true);
    let decodeStream;
    try {
      decodeStream = iconv.decodeStream(this.encoding);
    } catch (err) {
      throw new FileValidationError('L\'encodage du fichier n\'est pas supporté');
    }
    return this.stream.pipe(decodeStream).pipe(saxParser);
  }

  async _getRawStream() {
    let stream;
    if (await this._isFileZipped()) {
      stream = _unzippedStream(this.path);
    } else {
      stream = fs.createReadStream(this.path);
    }
    return stream;
  }

  async _isFileZipped() {
    const { mime } = await FileType.fromStream(this._getStreamWithoutBOM());
    return mime === ZIP;
  }

  async _readFirstLine() {
    const stream = await this._getRawStream();
    const firstLineReader = readline.createInterface({ input: stream });

    return await new Promise((resolve) => {
      firstLineReader.on('line', (line) => {
        firstLineReader.close();
        resolve(line);
      });
    });
  }

  _getStreamWithoutBOM() {
    const streamWithoutBOM = new StreamWithoutBOM();

    return fs.createReadStream(this.path).pipe(streamWithoutBOM);
  }

  _destroyStream() {
    this.stream.destroy();
  }

  async perform(callback) {
    try {
      await this._callbackAsPromise(callback);
    } finally {
      this._destroyStream();
    }
  }

  async _callbackAsPromise(callback) {
    const siecleFileStream = await this._getStream();

    return new Promise((resolve, reject) => {
      siecleFileStream.on('error', () => {
        reject(new FileValidationError(NO_STUDENTS_IMPORTED_FROM_INVALID_FILE));
      });
      callback(siecleFileStream, resolve, reject);
    });
  }
}

module.exports = SiecleFileStreamer;
