import fs from 'fs';
import path from 'path';
import csv from '@fast-csv/format';
import { yyyymmddhhmmss } from './timestamp.js';

export default class CsvFile {
  static write(filestream, rows, options) {
    return new Promise((res, rej) => {
      csv.writeToStream(filestream, rows, options)
        .on('error', (err) => rej(err))
        .on('finish', () => res());
    });
  }

  constructor(headers) {
    this.headers = headers;
    const timestamp = yyyymmddhhmmss();
    this.path = path.resolve(__dirname, `../${timestamp}-results.csv`);
    this.writeOpts = { headers: this.headers, includeEndRowDelimiter: true };
    this._createAndAddHeadersIfNotExisting();
  }

  _createAndAddHeadersIfNotExisting() {
    if (!fs.existsSync(this.path)) {
      fs.writeFileSync(this.path, this.headers.join(',') + '\n');
    }
  }

  append(rows) {
    return CsvFile.write(fs.createWriteStream(this.path, { flags: 'a' }), rows, {
      ...this.writeOpts,
      writeHeaders: false,
    });
  }
}


