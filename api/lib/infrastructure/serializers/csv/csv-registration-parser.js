const papa = require('papaparse');
const iconv = require('iconv-lite');
const { convertDateValue } = require('../../utils/date-utils');
const { CsvImportError } = require('../../../../lib/domain/errors');

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

class CsvColumn {
  constructor({ name, label, isRequired = false, isDate = false, checkEncoding = false }) {
    this.name = name;
    this.label = label;
    this.isRequired = isRequired;
    this.isDate = isDate;
    this.checkEncoding = checkEncoding;
  }
}

class CsvRegistrationParser {

  constructor(input, organizationId, columns, registrationSet) {
    this._input = input;
    this._organizationId = organizationId;
    this._columns = columns;
    this.registrationSet = registrationSet;
  }

  parse() {
    const encoding = this._getFileEncoding();
    const { registrationLines, fields } = this._parse(encoding);

    if (!encoding) {
      throw new CsvImportError(ERRORS.ENCODING_NOT_SUPPORTED);
    }

    this._checkColumns(fields);
    registrationLines.forEach((line, index) => {
      const registrationAttributes = this._lineToRegistrationAttributes(line);
      try {
        this.registrationSet.addRegistration(registrationAttributes);
      } catch (err) {
        this._handleError(err, index);
      }
    });
    return this.registrationSet;
  }

  /**
   * Identify which encoding has the given file.
   * To check it, we decode and parse the first line of the file with supported encodings.
   * If there is one with at least "First name" or "Student number" correctly parsed and decoded.
   */
  _getFileEncoding() {
    const supported_encodings = ['utf-8', 'win1252', 'macintosh'];
    const checkedColumns = this._getEncodingColumns();
    for (const encoding of supported_encodings) {
      const decodedInput = iconv.decode(this._input, encoding);
      const { meta: { fields } } = papa.parse(decodedInput, { ...PARSING_OPTIONS, preview: 1 });
      if (fields.some((value) => checkedColumns.includes(value))) {
        return encoding;
      }
    }
  }

  _getEncodingColumns() {
    const checkedColumns = this._columns.filter((c) => c.checkEncoding).map((c) => c.label);
    if (checkedColumns.length === 0) {
      return this._columns.map((c) => c.label);
    }
    return checkedColumns;
  }

  _parse(encoding = 'utf8') {
    const decodedInput = iconv.decode(this._input, encoding);
    const { data: registrationLines, meta: { fields }, errors } = papa.parse(decodedInput, PARSING_OPTIONS);

    if (errors.length) {
      const hasDelimiterError = errors.some((error) => error.type === 'Delimiter');
      if (hasDelimiterError) {
        throw new CsvImportError(ERRORS.BAD_CSV_FORMAT);
      }
    }

    return { registrationLines, fields };
  }

  _lineToRegistrationAttributes(line) {
    const registrationAttributes = {
      organizationId: this._organizationId,
    };

    this._columns.forEach((column) => {
      const value = line[column.label];
      if (column.isDate) {
        registrationAttributes[column.name] = this._buildDateAttribute(value);
      } else {
        registrationAttributes[column.name] = value;
      }
    });

    return registrationAttributes;
  }

  _checkColumns(parsedColumns) {
    // Required columns
    const missingMandatoryColumn = this._columns
      .filter((c) => c.isRequired)
      .find((c) => !parsedColumns.includes(c.label));
    if (missingMandatoryColumn) {
      throw new CsvImportError(ERRORS.HEADER_REQUIRED, { field: missingMandatoryColumn.label });
    }

    // Expected columns
    if (this._columns.some((column) => !parsedColumns.includes(column.label))) {
      throw new CsvImportError(ERRORS.HEADER_UNKNOWN);
    }
  }

  _buildDateAttribute(dateString) {
    const convertedDate = convertDateValue({ dateString, inputFormat: 'DD/MM/YYYY', alternativeInputFormat: 'DD/MM/YY', outputFormat: 'YYYY-MM-DD' });
    return convertedDate || dateString;
  }

  _handleError(err, index) {
    const column = this._columns.find((column) => column.name === err.key);
    const line = index + 2;
    const field = column.label;
    if (err.why === 'min_length') {
      throw new CsvImportError(ERRORS.FIELD_MIN_LENGTH, { line, field, limit: err.limit });
    }
    if (err.why === 'max_length') {
      throw new CsvImportError(ERRORS.FIELD_MAX_LENGTH, { line, field, limit: err.limit });
    }
    if (err.why === 'length') {
      throw new CsvImportError(ERRORS.FIELD_LENGTH, { line, field, limit: err.limit });
    }
    if (err.why === 'date_format' || err.why === 'not_a_date') {
      throw new CsvImportError(ERRORS.FIELD_DATE_FORMAT, { line, field });
    }
    if (err.why === 'email_format') {
      throw new CsvImportError(ERRORS.FIELD_EMAIL_FORMAT, { line, field });
    }
    if (err.why === 'required') {
      throw new CsvImportError(ERRORS.FIELD_REQUIRED, { line, field });
    }
    if (err.why === 'bad_values') {
      throw new CsvImportError(ERRORS.FIELD_BAD_VALUES, { line, field, valids: err.valids });
    }
    throw err;
  }
}

module.exports = {
  CsvColumn,
  CsvRegistrationParser,
};

