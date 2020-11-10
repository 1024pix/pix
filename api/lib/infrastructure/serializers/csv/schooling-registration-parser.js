const SchoolingRegistration = require('../../../domain/models/SchoolingRegistration');
const { checkValidation } = require('../../../domain/validators/schooling-registration-validator');
const { checkValidationUnicity } = require('../../../domain/validators/schooling-registration-set-validator');

const { CsvRegistrationParser, CsvColumn } = require('./csv-registration-parser');
const { CsvImportError } = require('../../../../lib/domain/errors');

const STATUS = SchoolingRegistration.STATUS;

const COLUMNS = [
  new CsvColumn({ name: 'nationalIdentifier', label: 'Identifiant unique*', isRequired: true }),
  new CsvColumn({ name: 'firstName', label: 'Premier prénom*', isRequired: true, checkEncoding: true }),
  new CsvColumn({ name: 'middleName', label: 'Deuxième prénom' }),
  new CsvColumn({ name: 'thirdName', label: 'Troisième prénom' }),
  new CsvColumn({ name: 'lastName', label: 'Nom de famille*', isRequired: true }),
  new CsvColumn({ name: 'preferredLastName', label: 'Nom d\'usage' }),
  new CsvColumn({ name: 'birthdate', label: 'Date de naissance (jj/mm/aaaa)*', isRequired: true, isDate: true }),
  new CsvColumn({ name: 'birthCityCode', label: 'Code commune naissance**' }),
  new CsvColumn({ name: 'birthCity', label: 'Libellé commune naissance**' }),
  new CsvColumn({ name: 'birthProvinceCode', label: 'Code département naissance*', isRequired: true }),
  new CsvColumn({ name: 'birthCountryCode', label: 'Code pays naissance*', isRequired: true }),
  new CsvColumn({ name: 'status', label: 'Statut*', isRequired: true }),
  new CsvColumn({ name: 'MEFCode', label: 'Code MEF*', isRequired: true }),
  new CsvColumn({ name: 'division', label: 'Division*', isRequired: true }),
];

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

  _transform(registrationAttributes)  {
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

  constructor(input, organizationId, hasApprentice = false) {
    const registrationSet = new SchoolingRegistrationSet(hasApprentice);

    super(input, organizationId, COLUMNS, registrationSet);
  }

  _handleError(err, index) {
    if (err.why === 'uniqueness') {
      throw new CsvImportError(`Ligne ${index + 2} : Le champ “Identifiant unique” ne doit pas contenir de doublon.`);
    }
   
    super._handleError(...arguments);
  }
}

SchoolingRegistrationParser.COLUMNS = COLUMNS;

module.exports = SchoolingRegistrationParser;

