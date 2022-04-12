const OrganizationLearner = require('../../../domain/models/OrganizationLearner');
const { checkValidation } = require('../../../domain/validators/schooling-registration-validator');

const { CsvRegistrationParser } = require('./csv-registration-parser');
const { CsvImportError, DomainError } = require('../../../../lib/domain/errors');
const SchoolingRegistrationColumns = require('./schooling-registration-columns');

const ERRORS = {
  IDENTIFIER_UNIQUE: 'IDENTIFIER_UNIQUE',
  INSEE_CODE_INVALID: 'INSEE_CODE_INVALID',
};

const sexPossibleValues = {
  M: 'M',
  F: 'F',
};

class SchoolingRegistrationSet {
  constructor() {
    this.registrations = [];
    this.existingNationalStudentIds = [];
  }

  addRegistration(registrationAttributes) {
    checkValidation(registrationAttributes);
    const transformedAttributes = this._transform(registrationAttributes);
    const organizationLearner = new OrganizationLearner(transformedAttributes);
    this.registrations.push(organizationLearner);

    this._checkRegistrationsUnicity(organizationLearner);
  }

  _transform(registrationAttributes) {
    let sex;
    const { birthCountryCode, nationalIdentifier } = registrationAttributes;

    if (registrationAttributes.sex) {
      sex = _convertSexCodeToLabel(registrationAttributes.sex);
    } else {
      sex = null;
    }

    return {
      ...registrationAttributes,
      birthCountryCode: birthCountryCode.slice(-3),
      nationalStudentId: nationalIdentifier,
      sex,
    };
  }

  _checkRegistrationsUnicity(registration) {
    // we removed JOI unicity validation (uniq)
    // because it took too much time (2h30  for 10000 registrations)
    // we did the same validation but manually
    if (this.existingNationalStudentIds.includes(registration.nationalStudentId)) {
      const err = new DomainError();
      err.key = 'nationalIdentifier';
      err.why = 'uniqueness';

      throw err;
    }
    this.existingNationalStudentIds.push(registration.nationalStudentId);
  }
}

function _convertSexCodeToLabel(sexCode) {
  if (sexCode) {
    return sexPossibleValues[sexCode.toUpperCase().charAt(0)];
  }
  return null;
}

class SchoolingRegistrationParser extends CsvRegistrationParser {
  constructor(input, organizationId, i18n) {
    const registrationSet = new SchoolingRegistrationSet();

    const columns = new SchoolingRegistrationColumns(i18n).columns;

    super(input, organizationId, columns, registrationSet);
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
    return new SchoolingRegistrationParser(...arguments);
  }
}

module.exports = SchoolingRegistrationParser;
