const HigherSchoolingRegistrationSet = require('../../../../lib/domain/models/HigherSchoolingRegistrationSet');
const { CsvImportError } = require('../../../../lib/domain/errors');

const { CsvRegistrationParser } = require('./csv-registration-parser');
const HigherSchoolingRegistrationColumns = require('./higher-schooling-registration-columns');

const ERRORS = {
  STUDENT_NUMBER_UNIQUE: 'STUDENT_NUMBER_UNIQUE',
  STUDENT_NUMBER_FORMAT: 'STUDENT_NUMBER_FORMAT',
};

class HigherSchoolingRegistrationParser extends CsvRegistrationParser {

  constructor(input, organizationId, i18n) {
    const registrationSet = new HigherSchoolingRegistrationSet();

    const columns = new HigherSchoolingRegistrationColumns(i18n).columns;

    super(input, organizationId, columns, registrationSet);
  }

  _handleError(err, index) {
    const column = this._columns.find((column) => column.name === err.key);
    const line = index + 2;
    const field = column.label;
    if (err.why === 'uniqueness') {
      throw new CsvImportError(ERRORS.STUDENT_NUMBER_UNIQUE, { line, field });
    }
    if (err.why === 'student_number_format') {
      throw new CsvImportError(ERRORS.STUDENT_NUMBER_FORMAT, { line, field });
    }
    super._handleError(...arguments);
  }
}

module.exports = HigherSchoolingRegistrationParser;
