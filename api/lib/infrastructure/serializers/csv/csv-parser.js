const papa = require('papaparse');
const iconv = require('iconv-lite');
const { CsvImportError } = require('../../../domain/errors');
const ERRORS = {
  ENCODING_NOT_SUPPORTED: 'ENCODING_NOT_SUPPORTED',
  BAD_CSV_FORMAT: 'BAD_CSV_FORMAT',
  HEADER_REQUIRED: 'HEADER_REQUIRED',
  HEADER_UNKNOWN: 'HEADER_UNKNOWN',
};

const PARSING_OPTIONS = {
  header: true,
  skipEmptyLines: 'greedy',
  transform: (value) => {
    if (typeof value === 'string') {
      value = value.replace('  ', ' ').trim();
    }

    return value;
  },
};

class CsvParser {
  constructor(input, header) {
    this._input = input;
    this._columns = header.columns;
  }

  _checkColumns(parsedColumns) {
    // Required columns
    const missingMandatoryColumn = this._columns
      .filter((c) => c.isRequired)
      .find((c) => !parsedColumns.includes(c.property));

    if (missingMandatoryColumn) {
      throw new CsvImportError(ERRORS.HEADER_REQUIRED, { field: missingMandatoryColumn.name });
    }

    // Expected columns
    const acceptedColumns = this._columns.map((column) => column.property);

    if (_atLeastOneParsedColumnDoesNotMatchAcceptedColumns(parsedColumns, acceptedColumns)) {
      throw new CsvImportError(ERRORS.HEADER_UNKNOWN);
    }
  }

  parse() {
    const encoding = this._getFileEncoding();

    if (!encoding) {
      throw new CsvImportError(ERRORS.ENCODING_NOT_SUPPORTED);
    }

    const { lines, fields, errors } = this._parse(encoding);

    this._checkColumns(fields);

    if (this._columns.length > 1 && errors.length) {
      const hasDelimiterError = errors.some((error) => ['Delimiter', 'FieldMismatch'].includes(error.type));
      if (hasDelimiterError) {
        throw new CsvImportError(ERRORS.BAD_CSV_FORMAT);
      }
    }

    return lines;
  }

  _getFileEncoding() {
    const supported_encodings = ['utf-8', 'win1252', 'macintosh'];
    const checkedColumns = this._getColumnsToCheckEncoding();

    let inputEncoding;
    for (const encoding of supported_encodings) {
      const decodedInput = iconv.decode(this._input, encoding);
      const {
        meta: { fields },
      } = papa.parse(decodedInput, { ...PARSING_OPTIONS, preview: 1 });
      if (fields.some((value) => checkedColumns.includes(value))) {
        inputEncoding = encoding;
      }
    }

    return inputEncoding;
  }

  _getColumnsToCheckEncoding() {
    const checkedColumns = this._columns.filter((c) => c.checkEncoding).map((c) => c.name);
    if (checkedColumns.length === 0) {
      return this._columns.map((c) => c.name);
    }
    return checkedColumns;
  }

  _parse(encoding = 'utf8') {
    const decodedInput = iconv.decode(this._input, encoding);

    const {
      data: lines,
      meta: { fields },
      errors,
    } = papa.parse(decodedInput, {
      ...PARSING_OPTIONS,
      transformHeader: (value) => {
        const column = this._columns.find((column) => column.name === value);

        return column ? column.property : value;
      },
    });

    return { lines, fields, errors };
  }
}

function _atLeastOneParsedColumnDoesNotMatchAcceptedColumns(parsedColumns, acceptedColumns) {
  return parsedColumns.some((parsedColumn) => {
    if (parsedColumn !== '') {
      return !acceptedColumns.includes(parsedColumn);
    }
  });
}

module.exports = {
  CsvParser,
};
