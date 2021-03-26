const SchoolingRegistration = require('../../../domain/models/SchoolingRegistration');
const { checkValidation } = require('../../../domain/validators/schooling-registration-validator');
const { checkValidationUnicity } = require('../../../domain/validators/schooling-registration-set-validator');

const { CsvRegistrationParser } = require('./csv-registration-parser');
const { CsvImportError } = require('../../../../lib/domain/errors');
const SchoolingRegistrationColumns = require('./schooling-registration-columns');

const STATUS = SchoolingRegistration.STATUS;

const ERRORS = {
  INA_FORMAT: 'INA_FORMAT',
  IDENTIFIER_UNIQUE: 'IDENTIFIER_UNIQUE',
  INSEE_CODE_INVALID: 'INSEE_CODE_INVALID',
};

class SchoolingRegistrationSet {
  constructor(hasApprentice) {
    this.registrations = [];
    this.hasApprentice = hasApprentice;
  }

  addRegistration(registrationAttributes) {
    checkValidation(registrationAttributes);
    const transformedAttributes = this._transform(registrationAttributes);
    const registration = new SchoolingRegistration(transformedAttributes);
    this.registrations.push(registration);
    checkValidationUnicity(this);
  }

  _transform(registrationAttributes) {
    let nationalStudentId;
    let nationalApprenticeId;
    const { birthCountryCode, nationalIdentifier, status } = registrationAttributes;

    if (!this.hasApprentice || status === STATUS.STUDENT) {
      nationalStudentId = nationalIdentifier;
    } else if (this.hasApprentice && status === STATUS.APPRENTICE) {
      nationalApprenticeId = nationalIdentifier;
    }

    return {
      ...registrationAttributes,
      birthCountryCode: birthCountryCode.slice(-3),
      nationalApprenticeId,
      nationalStudentId,
    };
  }
}

class SchoolingRegistrationParser extends CsvRegistrationParser {

  constructor(input, organizationId, i18n, hasApprentice = false) {
    const registrationSet = new SchoolingRegistrationSet(hasApprentice);

    const columns = new SchoolingRegistrationColumns(i18n).columns;

    super(input, organizationId, columns, registrationSet);
  }

  _handleError(err, index) {
    const column = this._columns.find((column) => column.name === err.key);
    const line = index + 2;
    const field = column.label;

    if (err.why === 'bad_pattern' && err.pattern === 'INA') {
      throw new CsvImportError(ERRORS.INA_FORMAT, { line, field });
    }

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
