const fs = require('fs');
const readline = require('readline');
const Stream = require('stream');
const StreamZip = require('node-stream-zip');
const FileType = require('file-type');
const iconv = require('iconv-lite');
const sax = require('sax');
const xmlEncoding = require('xml-buffer-tostring').xmlEncoding;


const DEFAULT_FILE_ENCODING = 'iso-8859-15';
const ZIP = 'zip';

class StreamPipe extends Stream.Transform {

  constructor() {
    super();
  }

  _transform(chunk, enc, cb) {
    this.push(chunk);
    cb();
  }
}

function _unzippedStream(path) {
  const zip = new StreamZip({ file: path });
  const stream = new StreamPipe();

  zip.on('entry', (entry) => {
    zip.stream(entry, (err, stm) => {

      if (!entry.name.includes('/')) {
        stm.pipe(stream);
      }
    });
  });
  return stream;
}


class XMLStreamer {
  static async create(path) {
    const stream = new XMLStreamer(path)
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

  async getStream(){
    this.stream = await this._getRawStream();
    const saxParser = sax.createStream(true);
    return this.stream.pipe(iconv.decodeStream(this.encoding)).pipe(saxParser);
  }

  async _getRawStream(){
    let stream;
    if (await this._isFileZipped()) {
      stream = _unzippedStream(this.path);
    }
    else {
      stream = fs.createReadStream(this.path);
    }
    return stream;
  }

  async _isFileZipped() {
    const { ext } = await FileType.fromFile(this.path);
    return ext === ZIP
  }

  async _readFirstLine() {
    const stream = await this._getRawStream();
    const firstLineReader = readline.createInterface({ input: stream });

    return await new Promise((resolve) => {
      firstLineReader.on('line', (line) => {
        firstLineReader.close();
        resolve(line);
      })
    });
  }

  destroyStream() {
    this.stream.destroy();
  }
}


module.exports = XMLStreamer;
