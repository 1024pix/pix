import iconv from 'iconv-lite';
import papa from 'papaparse';

import { CsvImportError } from '../../../../../../shared/domain/errors.js';

const ERRORS = {
  ENCODING_NOT_SUPPORTED: 'ENCODING_NOT_SUPPORTED',
  BAD_CSV_FORMAT: 'BAD_CSV_FORMAT',
  HEADER_REQUIRED: 'HEADER_REQUIRED',
};

const PARSING_OPTIONS = {
  header: true,
  skipEmptyLines: 'greedy',
  transform: (value) => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length ? trimmed : undefined;
    }
    return value;
  },
  transformHeader: (header) => header.trim(),
};

class GenericParser {
  #input;
  #errors;

  #columns;
  #supportedEncodings;

  constructor({ buffer, importFormat }) {
    this.#input = buffer;
    this.#errors = [];
    this.#columns = importFormat.config.headers;
    this.#supportedEncodings = importFormat.config.acceptedEncoding.toSorted((a, b) =>
      a === 'utf8' ? -1 : b === 'utf8' ? 1 : 0,
    );
  }

  static buildParser(options) {
    return new GenericParser(options);
  }

  parse(encoding) {
    const { rows, fields } = this.#parseCsvContent(encoding);

    this.#throwIfErrors();

    this.#validateRequiredColumns(fields);

    this.#throwIfErrors();

    return rows;
  }

  /**
   * Identify which encoding has the given file.
   * To check it, we decode and parse the first line of the file with supported encodings.
   * If there is one with at least "First name" or "Student number" correctly parsed and decoded.
   */
  getEncoding() {
    for (const encoding of this.#supportedEncodings) {
      const decodedInput = iconv.decode(this.#input, encoding);
      if (!decodedInput.includes('�')) {
        return encoding;
      }
    }

    this.#errors.push(new CsvImportError(ERRORS.ENCODING_NOT_SUPPORTED));
    this.#throwIfErrors();
  }

  #throwIfErrors() {
    if (this.#errors.length > 0) throw this.#errors;
  }

  #parseCsvContent(encoding) {
    const decodedInput = iconv.decode(this.#input, encoding);
    const {
      data: rows,
      meta: { fields },
      errors,
    } = papa.parse(decodedInput, PARSING_OPTIONS);

    if (errors.length) {
      const hasErrors = errors.some((error) => ['Delimiter', 'FieldMismatch'].includes(error.type));

      if (hasErrors) {
        this.#errors.push(new CsvImportError(ERRORS.BAD_CSV_FORMAT));
      }
    }

    this.#throwIfErrors();

    return { rows, fields };
  }

  #validateRequiredColumns(parsedColumns) {
    const requiredColumns = this.#columns.filter((column) => column.required);

    requiredColumns.forEach((colum) => {
      if (!parsedColumns.includes(colum.name)) {
        this.#errors.push(new CsvImportError(ERRORS.HEADER_REQUIRED, { field: colum.name }));
      }
    });
  }
}

export { GenericParser };
