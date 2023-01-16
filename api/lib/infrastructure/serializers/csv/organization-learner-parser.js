const OrganizationLearner = require('../../../domain/models/OrganizationLearner');
const { checkValidation } = require('../../../domain/validators/organization-learner-validator');

const { CsvOrganizationLearnerParser } = require('./csv-learner-parser');
const { CsvImportError, DomainError } = require('../../../domain/errors');
const OrganizationLearnerColumns = require('./organization-learner-columns');

const ERRORS = {
  IDENTIFIER_UNIQUE: 'IDENTIFIER_UNIQUE',
  INSEE_CODE_INVALID: 'INSEE_CODE_INVALID',
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
    const sex = learnerAttributes.sex.toUpperCase();
    return {
      ...learnerAttributes,
      birthCountryCode: birthCountryCode.slice(-3),
      nationalStudentId: nationalIdentifier,
      division: division?.trim().replace(/\s+/g, ' '),
      sex,
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

class OrganizationLearnerParser extends CsvOrganizationLearnerParser {
  constructor(input, organizationId, i18n) {
    const learnerSet = new OrganizationLearnerSet();

    const columns = new OrganizationLearnerColumns(i18n).columns;

    super(input, organizationId, columns, learnerSet);
  }

  _handleError(err, index) {
    const column = this._columns.find((column) => column.name === err.key);
    const line = index + 2;
    const field = column.label;

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

module.exports = OrganizationLearnerParser;
