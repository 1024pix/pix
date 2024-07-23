import { CsvImportError } from '../../../../../shared/domain/errors.js';
import { SupOrganizationLearnerSet } from '../../../domain/models/SupOrganizationLearnerSet.js';
import { CsvOrganizationLearnerParser } from './csv-organization-learner-parser.js';
import { SupOrganizationLearnerImportHeader } from './sup-organization-learner-import-header.js';

const ERRORS = {
  STUDENT_NUMBER_UNIQUE: 'STUDENT_NUMBER_UNIQUE',
  STUDENT_NUMBER_FORMAT: 'STUDENT_NUMBER_FORMAT',
};

class SupOrganizationLearnerParser extends CsvOrganizationLearnerParser {
  static buildParser(input, organizationId, i18n) {
    return new SupOrganizationLearnerParser(input, organizationId, i18n);
  }

  constructor(input, organizationId, i18n) {
    const LearnerSet = new SupOrganizationLearnerSet(i18n);

    const columns = new SupOrganizationLearnerImportHeader(i18n).columns;
    super(input, organizationId, columns, LearnerSet);
    this._supportedErrors.push('uniqueness', 'student_number_format');
  }

  _handleValidationError(errors, index) {
    errors.forEach((err) => {
      const column = this._columns.find((column) => column.property === err.key);
      const line = index + 2;
      const field = column.name;
      if (err.why === 'uniqueness') {
        this._errors.push(new CsvImportError(ERRORS.STUDENT_NUMBER_UNIQUE, { line, field }));
      }
      if (err.why === 'student_number_format') {
        this._errors.push(new CsvImportError(ERRORS.STUDENT_NUMBER_FORMAT, { line, field }));
      }
    });
    super._handleValidationError(...arguments);
  }
}

export { SupOrganizationLearnerParser };
