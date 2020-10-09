const SchoolingRegistration = require('../../../domain/models/SchoolingRegistration');
const { checkValidation } = require('../../../domain/validators/schooling-registration-validator');
const { CsvImportError } = require('../../../../lib/domain/errors');

const { CsvRegistrationParser, CsvColumn } = require('./csv-registration-parser');

const COLUMNS = [
  new CsvColumn({ name: 'nationalStudentId', label: 'Identifiant unique*', isRequired: true }),
  new CsvColumn({ name: 'firstName', label: 'Premier prénom*', isRequired: true, checkEncoding: true }),
  new CsvColumn({ name: 'middleName', label:'Deuxième prénom' }),
  new CsvColumn({ name: 'thirdName', label:'Troisième prénom' }),
  new CsvColumn({ name: 'lastName', label:'Nom de famille*', isRequired: true }),
  new CsvColumn({ name: 'preferredLastName', label:'Nom d’usage' }),
  new CsvColumn({ name: 'birthdate', label:'Date de naissance (jj/mm/aaaa)*', isRequired: true, isDate: true }),
  new CsvColumn({ name: 'birthCityCode', label:'Code commune naissance**' }),
  new CsvColumn({ name: 'birthCity', label:'Libellé commune naissance**' }),
  new CsvColumn({ name: 'birthProvinceCode', label:'Code département naissance*', isRequired: true }),
  new CsvColumn({ name: 'birthCountryCode', label:'Code pays naissance*', isRequired: true }),
  new CsvColumn({ name: 'status', label:'Statut*', isRequired: true }),
  new CsvColumn({ name: 'MEFCode', label:'Code MEF*', isRequired: true }),
  new CsvColumn({ name: 'division', label:'Division*', isRequired: true }),
];

class SchoolingRegistrationSet {
  constructor() {
    this.registrations = [];
  }

  addRegistration(registrationAttributes) {
    checkValidation(registrationAttributes);
    const transformedAttributes = this._transform(registrationAttributes);
    const registration = new SchoolingRegistration(transformedAttributes);
    this.registrations.push(registration);
  }

  _transform(registrationAttributes)  {
    const { birthCountryCode } = registrationAttributes;
    return {
      ...registrationAttributes,
      birthCountryCode: birthCountryCode.slice(-3),
    };
  }
}

class SchoolingRegistrationParser extends CsvRegistrationParser {

  constructor(input, organizationId) {
    super(input, organizationId, COLUMNS);
  }

  parse() {
    const registrationSet = new SchoolingRegistrationSet();
    super.parse({
      registrationSet,
      onParseLineError: this._handleError,
    });
    return registrationSet.registrations;
  }

  _handleError(err, index) {
    const column = COLUMNS.find((column) => column.name === err.key);
    if (err.why === 'max_length') {
      throw new CsvImportError(`Ligne ${index + 2} : Le champ “${column.label}” doit être inférieur à ${err.limit} caractères.`);
    }
    if (err.why === 'not_a_date' || err.why === 'date_format') {
      throw new CsvImportError(`Ligne ${index + 2} : Le champ “${column.label}” doit être au format jj/mm/aaaa.`);
    }
    if (err.why === 'required') {
      throw new CsvImportError(`Ligne ${index + 2} : Le champ “${column.label}” est obligatoire.`);
    }
    if (err.why === 'bad_values') {
      throw new CsvImportError(`Ligne ${index + 2} : Le champ “${column.label}” doit être "${err.valids.join(' ou ')}".`);
    }
    throw err;
  }
}

module.exports = SchoolingRegistrationParser;

