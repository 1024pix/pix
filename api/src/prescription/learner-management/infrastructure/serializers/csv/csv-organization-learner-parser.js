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

class CsvOrganizationLearnerParser {
  constructor(input, organizationId, columns, learnerSet) {
    this._input = input;
    this._organizationId = organizationId;
    this._errors = [];
    this._columns = columns;
    this.learnerSet = learnerSet;
    this._supportedErrors = [
      'min_length',
      'max_length',
      'length',
      'date_format',
      'email_format',
      'required',
      'bad_values',
    ];
  }

  parse(encoding) {
    if (!encoding) {
      this._errors.push(new CsvImportError(ERRORS.ENCODING_NOT_SUPPORTED));
    }

    this.throwHasErrors();

    const { learnerLines, fields } = this._parse(encoding);
    this.throwHasErrors();

    this._checkColumns(fields);

    this.throwHasErrors();

    learnerLines.forEach((line, index) => {
      const learnerAttributes = this._lineToOrganizationLearnerAttributes(line);
      try {
        this.learnerSet.addLearner(learnerAttributes);
      } catch (errors) {
        this._handleValidationError(errors, index);
      }
    });

    this.throwHasErrors();
    return this.learnerSet;
  }

  throwHasErrors() {
    if (this._errors.length > 0) throw new AggregateImportError(this._errors);
  }

  /**
   * Identify which encoding has the given file.
   * To check it, we decode and parse the first line of the file with supported encodings.
   * If there is one with at least "First name" or "Student number" correctly parsed and decoded.
   */
  getFileEncoding() {
    const supported_encodings = ['utf-8', 'win1252', 'macintosh'];
    const checkedColumns = this._getEncodingColumns();
    for (const encoding of supported_encodings) {
      const decodedInput = iconv.decode(this._input, encoding);
      const {
        meta: { fields },
      } = papa.parse(decodedInput, { ...PARSING_OPTIONS, preview: 1 });
      if (fields.some((value) => checkedColumns.includes(value))) {
        return encoding;
      }
    }
  }

  _getEncodingColumns() {
    const checkedColumns = this._columns.filter((c) => c.checkEncoding).map((c) => c.name);
    if (checkedColumns.length === 0) {
      return this._columns.map((c) => c.name);
    }
    return checkedColumns;
  }

  _parse(encoding = 'utf8') {
    const decodedInput = iconv.decode(this._input, encoding);
    const {
      data: learnerLines,
      meta: { fields },
      errors,
    } = papa.parse(decodedInput, PARSING_OPTIONS);
    if (errors.length) {
      const hasDelimiterError = errors.some((error) => error.type === 'Delimiter');
      if (hasDelimiterError) {
        this._errors.push(new CsvImportError(ERRORS.BAD_CSV_FORMAT));
      }
    }

    this.throwHasErrors();

    return { learnerLines, fields };
  }

  _lineToOrganizationLearnerAttributes(line) {
    const learnerAttributes = {
      organizationId: this._organizationId,
    };

    this._columns.forEach((column) => {
      const value = line[column.name];
      if (column.isDate) {
        learnerAttributes[column.property] = this._buildDateAttribute(value);
      } else {
        learnerAttributes[column.property] = value;
      }
    });

    return learnerAttributes;
  }

  _checkColumns(parsedColumns) {
    // Required columns
    const mandatoryColumn = this._columns.filter((c) => c.isRequired);

    mandatoryColumn.forEach((colum) => {
      if (!parsedColumns.includes(colum.name)) {
        this._errors.push(new CsvImportError(ERRORS.HEADER_REQUIRED, { field: colum.name }));
      }
    });

    // Expected columns
    const acceptedColumns = this._columns.map((column) => column.name);

    const unknowColumns = parsedColumns.filter((columnName) => !acceptedColumns.includes(columnName));

    unknowColumns.forEach((columnName) => {
      if (columnName !== '') this._errors.push(new CsvImportError(ERRORS.HEADER_UNKNOWN, { field: columnName }));
    });
  }

  _buildDateAttribute(dateString) {
    const convertedDate = convertDateValue({
      dateString,
      inputFormat: 'DD/MM/YYYY',
      alternativeInputFormat: 'DD/MM/YY',
      outputFormat: 'YYYY-MM-DD',
    });
    return convertedDate || dateString;
  }

  _handleValidationError(errors, index) {
    errors.forEach((err) => {
      const column = this._columns.find((column) => column.property === err.key);
      const line = index + 2;
      const field = column.name;

      if (err.why === 'min_length') {
        this._errors.push(new CsvImportError(ERRORS.FIELD_MIN_LENGTH, { line, field, limit: err.limit }));
      }
      if (err.why === 'max_length') {
        this._errors.push(new CsvImportError(ERRORS.FIELD_MAX_LENGTH, { line, field, limit: err.limit }));
      }
      if (err.why === 'length') {
        this._errors.push(new CsvImportError(ERRORS.FIELD_LENGTH, { line, field, limit: err.limit }));
      }
      if (err.why === 'date_format' || err.why === 'not_a_date') {
        this._errors.push(new CsvImportError(ERRORS.FIELD_DATE_FORMAT, { line, field }));
      }
      if (err.why === 'email_format') {
        this._errors.push(new CsvImportError(ERRORS.FIELD_EMAIL_FORMAT, { line, field }));
      }
      if (err.why === 'required') {
        this._errors.push(new CsvImportError(ERRORS.FIELD_REQUIRED, { line, field }));
      }
      if (err.why === 'bad_values') {
        this._errors.push(new CsvImportError(ERRORS.FIELD_BAD_VALUES, { line, field, valids: err.valids }));
      }

      if (!this._supportedErrors.includes(err.why)) this._errors.push(err);
    });
  }
}

export { CsvOrganizationLearnerParser };
