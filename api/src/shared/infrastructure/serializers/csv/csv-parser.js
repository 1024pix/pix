import iconv from 'iconv-lite';
import papa from 'papaparse';

import { CsvImportError } from '../../../domain/errors.js';

const ERRORS = {
  ENCODING_NOT_SUPPORTED: 'ENCODING_NOT_SUPPORTED',
  VALUE_NOT_ACCEPTED: 'VALUE_NOT_ACCEPTED',
  BAD_CSV_FORMAT: 'BAD_CSV_FORMAT',
  HEADER_REQUIRED: 'HEADER_REQUIRED',
  HEADER_UNKNOWN: 'HEADER_UNKNOWN',
};

class CsvParser {
  constructor(input, header, options = {}) {
    this._input = input;
    this._columns = header.columns;
    this._options = options;
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

  parse(forceEncoding) {
    const encoding = forceEncoding || this._getFileEncoding();

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
      } = papa.parse(decodedInput, {
        header: true,
        skipEmptyLines: 'greedy',
        transformHeader: (value) => {
          return value.trim();
        },
        preview: 1,
        ...this._options,
      });
      if (fields.some((value) => checkedColumns.includes(value))) {
        inputEncoding = encoding;
        break;
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

  _parse(encoding = 'utf-8') {
    const decodedInput = iconv.decode(this._input, encoding);

    const {
      data: lines,
      meta: { fields },
      errors,
    } = papa.parse(decodedInput, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (value) => {
        const trimmedValue = value.trim();
        const column = this._columns.find((column) => column.name === trimmedValue);

        return column ? column.property : trimmedValue;
      },
      transform: (rawValue, columnName) => {
        const value = typeof rawValue === 'string' ? rawValue.replace('  ', ' ').trim() : rawValue;

        if (value === '') {
          return null;
        }

        const column = this._columns.find((column) => column.property === columnName);

        if (column) {
          if (column.isInteger) return parseInt(value, 10);

          if (column.acceptedValues?.length > 0 && !column.acceptedValues.includes(value)) {
            throw new CsvImportError(ERRORS.VALUE_NOT_ACCEPTED, {
              field: column.name,
              value,
              acceptedValues: column.acceptedValues,
            });
          }

          if (column.transformValues && typeof column.transformValues === 'object') {
            return column.transformValues[value] ?? value;
          }
        }

        return value;
      },
      ...this._options,
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

export { CsvParser };
