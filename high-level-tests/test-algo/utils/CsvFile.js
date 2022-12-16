const fs = require('fs');
const path = require('path');
const csv = require('@fast-csv/format');
const { yyyymmddhhmmss } = require('./timestamp');

class CsvFile {
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

module.exports = CsvFile;
