import { CsvImportError } from '../../../../../../shared/domain/errors.js';
import { FregataOrganizationLearnerSet } from '../../../../domain/models/FregataOrganizationLearnerSet.js';
import { FregataHeader } from '../headers/fregata-header.js';
import { SharedCsvParser } from './shared-csv-parser.js';

const ERRORS = {
  IDENTIFIER_UNIQUE: 'IDENTIFIER_UNIQUE',
  INSEE_CODE_INVALID: 'INSEE_CODE_INVALID',
};

class FregataParser extends SharedCsvParser {
  constructor(input, organizationId, i18n) {
    const learnerSet = new FregataOrganizationLearnerSet();
    const columns = new FregataHeader(i18n).columns;

    super(input, organizationId, columns, learnerSet);
    this._supportedErrors.push('uniqueness', 'not_valid_insee_code');
    this._errors = [];
  }

  _handleValidationError(errors, index) {
    errors.forEach((err) => {
      const column = this._columns.find((column) => column.property === err.key);
      const line = index + 2;
      const field = column.name;

      if (err.why === 'uniqueness' && err.key === 'nationalIdentifier') {
        this._errors.push(new CsvImportError(ERRORS.IDENTIFIER_UNIQUE, { line, field }));
      }

      if (err.why === 'not_valid_insee_code') {
        this._errors.push(new CsvImportError(ERRORS.INSEE_CODE_INVALID, { line, field }));
      }
    });

    super._handleValidationError(...arguments);
  }

  static buildParser() {
    return new FregataParser(...arguments);
  }
}

export { FregataParser };
