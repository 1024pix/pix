import { OrganizationLearner } from '../../../domain/models/OrganizationLearner.js';
import { checkValidation } from '../../../domain/validators/organization-learner-validator.js';
import { CsvOrganizationLearnerParser } from './csv-learner-parser.js';
import { DomainError, CsvImportError } from '../../../../../shared/domain/errors.js';
import { OrganizationLearnerImportHeader } from './organization-learner-import-header.js';

const ERRORS = {
  IDENTIFIER_UNIQUE: 'IDENTIFIER_UNIQUE',
  INSEE_CODE_INVALID: 'INSEE_CODE_INVALID',
};

const sexPossibleValues = {
  M: 'M',
  F: 'F',
};

class OrganizationLearnerSet {
  constructor() {
    this.learners = [];
    this.existingNationalStudentIds = [];
  }

  addLearner(learnerAttributes) {
    checkValidation(learnerAttributes);
    const transformedAttributes = this._transform(learnerAttributes);
    const organizationLearner = new OrganizationLearner(transformedAttributes);
    this.learners.push(organizationLearner);

    this._checkOrganizationLearnersUnicity(organizationLearner);
  }

  _transform(learnerAttributes) {
    const { birthCountryCode, nationalIdentifier, division } = learnerAttributes;

    return {
      ...learnerAttributes,
      birthCountryCode: birthCountryCode.slice(-3),
      nationalStudentId: nationalIdentifier,
      division: division?.trim().replace(/\s+/g, ' '),
      sex: _convertSexCodeToLabel(learnerAttributes.sex),
    };
  }

  _checkOrganizationLearnersUnicity(organizationLearner) {
    // we removed JOI unicity validation (uniq)
    // because it took too much time (2h30  for 10000 learners)
    // we did the same validation but manually
    if (this.existingNationalStudentIds.includes(organizationLearner.nationalStudentId)) {
      const err = new DomainError();
      err.key = 'nationalIdentifier';
      err.why = 'uniqueness';

      throw err;
    }
    this.existingNationalStudentIds.push(organizationLearner.nationalStudentId);
  }
}

function _convertSexCodeToLabel(sexCode) {
  return sexPossibleValues[sexCode.toUpperCase().charAt(0)];
}

class OrganizationLearnerParser extends CsvOrganizationLearnerParser {
  constructor(input, organizationId, i18n) {
    const learnerSet = new OrganizationLearnerSet();

    const columns = new OrganizationLearnerImportHeader(i18n).columns;

    super(input, organizationId, columns, learnerSet);
  }

  _handleError(err, index) {
    const column = this._columns.find((column) => column.property === err.key);
    const line = index + 2;
    const field = column.name;

    if (err.why === 'uniqueness' && err.key === 'nationalIdentifier') {
      throw new CsvImportError(ERRORS.IDENTIFIER_UNIQUE, { line, field });
    }

    if (err.why === 'not_valid_insee_code') {
      throw new CsvImportError(ERRORS.INSEE_CODE_INVALID, { line, field });
    }

    super._handleError(...arguments);
  }

  static buildParser() {
    return new OrganizationLearnerParser(...arguments);
  }
}

export { OrganizationLearnerParser };
