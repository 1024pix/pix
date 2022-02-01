const SchoolingRegistration = require('../../../domain/models/SchoolingRegistration');
const { checkValidation } = require('../../../domain/validators/schooling-registration-validator');
const { checkValidationUnicity } = require('../../../domain/validators/schooling-registration-set-validator');

const { CsvRegistrationParser } = require('./csv-registration-parser');
const { CsvImportError } = require('../../../../lib/domain/errors');
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
  }

  addRegistration(registrationAttributes) {
    checkValidation(registrationAttributes);
    const transformedAttributes = this._transform(registrationAttributes);
    const registration = new SchoolingRegistration(transformedAttributes);
    this.registrations.push(registration);
    checkValidationUnicity(this);
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
