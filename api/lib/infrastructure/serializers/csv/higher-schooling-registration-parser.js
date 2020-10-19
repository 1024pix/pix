const HigherSchoolingRegistrationSet = require('../../../../lib/domain/models/HigherSchoolingRegistrationSet');
const { CsvImportError } = require('../../../../lib/domain/errors');

const { CsvRegistrationParser, CsvColumn } = require('./csv-registration-parser');

const COLUMNS = [
  new CsvColumn({ name: 'firstName', label: 'Premier prénom', isRequired: true, checkEncoding: true }),
  new CsvColumn({ name: 'middleName', label:'Deuxième prénom' }),
  new CsvColumn({ name: 'thirdName', label:'Troisième prénom' }),
  new CsvColumn({ name: 'lastName', label:'Nom de famille', isRequired: true }),
  new CsvColumn({ name: 'preferredLastName', label:'Nom d’usage' }),
  new CsvColumn({ name: 'birthdate', label:'Date de naissance (jj/mm/aaaa)', isRequired: true, isDate: true }),
  new CsvColumn({ name: 'email', label:'Email' }),
  new CsvColumn({ name: 'studentNumber', label:'Numéro étudiant', isRequired: true, checkEncoding: true }),
  new CsvColumn({ name: 'department', label:'Composante' }),
  new CsvColumn({ name: 'educationalTeam', label:'Équipe pédagogique' }),
  new CsvColumn({ name: 'group', label:'Groupe' }),
  new CsvColumn({ name: 'diploma', label:'Diplôme' }),
  new CsvColumn({ name: 'studyScheme', label:'Régime' }),
];

class HigherSchoolingRegistrationParser extends CsvRegistrationParser {

  constructor(input, organizationId) {
    const registrationSet = new HigherSchoolingRegistrationSet();
    super(input, organizationId, COLUMNS, registrationSet);
  }

  _handleError(err, index) {
    if (err.why === 'uniqueness') {
      throw new CsvImportError(`Ligne ${index + 2} : Le champ “Numéro étudiant” doit être unique au sein du fichier.`);
    }
    if (err.why === 'student_number_format') {
      throw new CsvImportError(`Ligne ${index + 2} : Le champ “numéro étudiant” ne doit pas avoir de caractères spéciaux.`);
    }
    super._handleError(...arguments);
  }
}

HigherSchoolingRegistrationParser.COLUMNS = COLUMNS;

module.exports = HigherSchoolingRegistrationParser;

