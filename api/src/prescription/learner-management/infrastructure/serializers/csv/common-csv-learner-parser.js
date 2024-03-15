import iconv from 'iconv-lite';
import papa from 'papaparse';

import { CsvImportError } from '../../../../../shared/domain/errors.js';
import { convertDateValue } from '../../../../../shared/infrastructure/utils/date-utils.js';
import { AggregateImportError } from '../../../domain/errors.js';

const ERRORS = {
  ENCODING_NOT_SUPPORTED: 'ENCODING_NOT_SUPPORTED',
  BAD_CSV_FORMAT: 'BAD_CSV_FORMAT',
  HEADER_REQUIRED: 'HEADER_REQUIRED',
  HEADER_UNKNOWN: 'HEADER_UNKNOWN',
  FIELD_MIN_LENGTH: 'FIELD_MIN_LENGTH',
  FIELD_MAX_LENGTH: 'FIELD_MAX_LENGTH',
  FIELD_LENGTH: 'FIELD_LENGTH',
  FIELD_DATE_FORMAT: 'FIELD_DATE_FORMAT',
  FIELD_EMAIL_FORMAT: 'FIELD_EMAIL_FORMAT',
  FIELD_REQUIRED: 'FIELD_REQUIRED',
  FIELD_BAD_VALUES: 'FIELD_BAD_VALUES',
};

const PARSING_OPTIONS = {
  header: true,
  skipEmptyLines: 'greedy',
  transform: (value) => {
    if (typeof value === 'string') {
      value = value.trim();
      return value.length ? value : undefined;
    }
    return value;
  },
};

class CommonCsvLearerParser {
  #input;
  #encoding;
  #organizationId;
  #errors;

  // compute heading
  #columns;
  // compute validation to handle error
  #supportedErrors;
  // compute support_enconding
  #supportedEncodings;

  constructor(input, organizationId, config) {
    this.#input = input;
    this.#encoding;
    this.#organizationId = organizationId;
    this.#errors = [];

    // compute heading
    this.#columns = config.headers;

    // compute validation to handle error
    this.#supportedErrors = config.supportedErrors;

    // compute support_enconding
    this.#supportedEncodings = config.acceptedEncoding;
  }

  parse() {
    const { fields } = this.#parse();

    this.#throwHasErrors();

    this.#checkColumns(fields);

    this.#throwHasErrors();
  }

  #throwHasErrors() {
    if (this.#errors.length > 0) throw new AggregateImportError(this.#errors);
  }

  /**
   * Identify which encoding has the given file.
   * To check it, we decode and parse the first line of the file with supported encodings.
   * If there is one with at least "First name" or "Student number" correctly parsed and decoded.
   */
  setEncoding() {
    const supported_encodings = this.#supportedEncodings;
    for (const encoding of supported_encodings) {
      const decodedInput = iconv.decode(this.#input, encoding);
      if (!decodedInput.includes('�')) {
        this.#encoding = encoding;
      }
    }

    if (!this.#encoding) {
      this.#errors.push(new CsvImportError(ERRORS.ENCODING_NOT_SUPPORTED));
      this.#throwHasErrors();
    }
  }

  getEncoding() {
    return this.#encoding;
  }

  #parse() {
    const decodedInput = iconv.decode(this.#input, this.#encoding);
    const {
      data: learnerLines,
      meta: { fields },
      errors,
    } = papa.parse(decodedInput, PARSING_OPTIONS);

    if (errors.length) {
      const hasDelimiterError = errors.some((error) => error.type === 'Delimiter');
      if (hasDelimiterError) {
        this.#errors.push(new CsvImportError(ERRORS.BAD_CSV_FORMAT));
      }
    }

    this.#throwHasErrors();

    return { learnerLines, fields };
  }

  _lineToOrganizationLearnerAttributes(line) {
    const learnerAttributes = {
      organizationId: this.#organizationId,
    };

    this.#columns.forEach((column) => {
      const value = line[column.name];
      if (column.isDate) {
        learnerAttributes[column.property] = this.#buildDateAttribute(value);
      } else {
        learnerAttributes[column.property] = value;
      }
    });

    return learnerAttributes;
  }

  #checkColumns(parsedColumns) {
    // Required columns
    const mandatoryColumn = this.#columns.filter((c) => c.isRequired);

    mandatoryColumn.forEach((colum) => {
      if (!parsedColumns.includes(colum.name)) {
        this.#errors.push(new CsvImportError(ERRORS.HEADER_REQUIRED, { field: colum.name }));
      }
    });

    // Expected columns
    const acceptedColumns = this.#columns.map((column) => column.name);

    const unknowColumns = parsedColumns.filter((columnName) => !acceptedColumns.includes(columnName));

    unknowColumns.forEach((columnName) => {
      if (columnName !== '') this.#errors.push(new CsvImportError(ERRORS.HEADER_UNKNOWN, { field: columnName }));
    });
  }

  #buildDateAttribute(dateString) {
    const convertedDate = convertDateValue({
      dateString,
      inputFormat: 'DD/MM/YYYY',
      alternativeInputFormat: 'DD/MM/YY',
      outputFormat: 'YYYY-MM-DD',
    });
    return convertedDate || dateString;
  }

  #handleValidationError(errors, index) {
    errors.forEach((err) => {
      const column = this.#columns.find((column) => column.property === err.key);
      const line = index + 2;
      const field = column.name;

      // iterate on supported error to push errors

      if (err.why === 'min_length') {
        this.#errors.push(new CsvImportError(ERRORS.FIELD_MIN_LENGTH, { line, field, limit: err.limit }));
      }
      if (err.why === 'max_length') {
        this.#errors.push(new CsvImportError(ERRORS.FIELD_MAX_LENGTH, { line, field, limit: err.limit }));
      }
      if (err.why === 'length') {
        this.#errors.push(new CsvImportError(ERRORS.FIELD_LENGTH, { line, field, limit: err.limit }));
      }
      if (err.why === 'date_format' || err.why === 'not_a_date') {
        this.#errors.push(new CsvImportError(ERRORS.FIELD_DATE_FORMAT, { line, field }));
      }
      if (err.why === 'email_format') {
        this.#errors.push(new CsvImportError(ERRORS.FIELD_EMAIL_FORMAT, { line, field }));
      }
      if (err.why === 'required') {
        this.#errors.push(new CsvImportError(ERRORS.FIELD_REQUIRED, { line, field }));
      }
      if (err.why === 'bad_values') {
        this.#errors.push(new CsvImportError(ERRORS.FIELD_BAD_VALUES, { line, field, valids: err.valids }));
      }

      if (!this.#supportedErrors.includes(err.why)) this.#errors.push(err);
    });
  }
}

export { CommonCsvLearerParser };
