import iconv from 'iconv-lite';
import papa from 'papaparse';

import { CsvImportError } from '../../../../../shared/domain/errors.js';
import { AggregateImportError } from '../../../domain/errors.js';
import { ImportOrganizationLearnerSet } from '../../../domain/models/CommonOrganizationLearnerSet.js';

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
      value = value.trim();
      return value.length ? value : undefined;
    }
    return value;
  },
};

const CSV_LEARNER_STARTING_LINE = 2;

class CommonCsvLearerParser {
  #input;
  #encoding;
  #organizationId;
  #errors;
  #learnerSet;

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
    this.#learnerSet = new ImportOrganizationLearnerSet(config.validationRules);
    this.#errors = [];

    // compute heading
    this.#columns = config.headers;

    // compute validation to handle error
    this.#supportedErrors = config.supportedErrors;

    // compute support_enconding
    this.#supportedEncodings = config.acceptedEncoding;
  }

  parse() {
    const { learnerLines, fields } = this.#parse();

    this.#throwHasErrors();

    this.#checkColumns(fields);

    this.#throwHasErrors();

    learnerLines.forEach((line, index) => {
      try {
        this.#learnerSet.addLearner(this.#lineToOrganizationLearnerAttributes(line));
      } catch (errors) {
        this.#handleValidationError(errors, index);
      }
    });

    this.#throwHasErrors();
    return this.#learnerSet.getLearners();
  }

  /**
   * Identify which encoding has the given file.
   * To check it, we decode and parse the first line of the file with supported encodings.
   * If there is one with at least "First name" or "Student number" correctly parsed and decoded.
   */
  findEncoding() {
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

  #throwHasErrors() {
    if (this.#errors.length > 0) throw new AggregateImportError(this.#errors);
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

  #lineToOrganizationLearnerAttributes(line) {
    const learnerAttributes = {
      organizationId: this.#organizationId,
      attributes: {},
    };

    this.#columns.forEach((column) => {
      const value = line[column.name];
      if (column.property) {
        learnerAttributes[column.property] = value;
      } else {
        learnerAttributes.attributes[column.name] = value?.toString();
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

  #handleValidationError(errors, index) {
    errors.forEach((error) => {
      const line = index + CSV_LEARNER_STARTING_LINE;
      const field = error.key;

      if (error.why === 'uniqueness') {
        this.#errors.push(new CsvImportError(error.code, { line, field }));
      }

      if (error.why === 'date_format') {
        this.#errors.push(new CsvImportError(error.code, { line, field, acceptedFormat: error.acceptedFormat }));
      }

      if (error.why === 'field_required') {
        this.#errors.push(new CsvImportError(error.code, { line, field }));
      }
    });
  }
}

export { CommonCsvLearerParser };
