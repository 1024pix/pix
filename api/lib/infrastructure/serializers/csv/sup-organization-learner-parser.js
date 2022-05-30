const SupOrganizationLearnerSet = require('../../../domain/models/SupOrganizationLearnerSet');
const { CsvImportError } = require('../../../domain/errors');

const { CsvOrganizationLearnerParser } = require('./csv-learner-parser');
const SupOrganizationLearnerColumns = require('./sup-organization-learner-columns');

const ERRORS = {
  STUDENT_NUMBER_UNIQUE: 'STUDENT_NUMBER_UNIQUE',
  STUDENT_NUMBER_FORMAT: 'STUDENT_NUMBER_FORMAT',
};

class SupOrganizationLearnerParser extends CsvOrganizationLearnerParser {
  constructor(input, organizationId, i18n) {
    const LearnerSet = new SupOrganizationLearnerSet(i18n);

    const columns = new SupOrganizationLearnerColumns(i18n).columns;

    super(input, organizationId, columns, LearnerSet);
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

module.exports = SupOrganizationLearnerParser;
