const HigherSchoolingRegistrationSet = require('../../../../lib/domain/models/HigherSchoolingRegistrationSet');
const { CsvImportError } = require('../../../../lib/domain/errors');

const { CsvRegistrationParser, CsvColumn } = require('./csv-registration-parser');

const COLUMNS = [
  new CsvColumn({ name: 'firstName', label: 'Premier prénom', isRequired: true, checkEncoding: true }),
  new CsvColumn({ name: 'middleName', label:'Deuxième prénom' }),
  new CsvColumn({ name: 'thirdName', label:'Troisième prénom' }),
  new CsvColumn({ name: 'lastName', label:'Nom de famille', isRequired: true }),
  new CsvColumn({ name: 'preferredLastName', label:'Nom d’usage' }),
  new CsvColumn({ name: 'studentNumber', label:'Numéro étudiant', isRequired: true, checkEncoding: true }),
  new CsvColumn({ name: 'email', label:'Email' }),
  new CsvColumn({ name: 'diploma', label:'Diplôme' }),
  new CsvColumn({ name: 'department', label:'Composante' }),
  new CsvColumn({ name: 'educationalTeam', label:'Équipe pédagogique' }),
  new CsvColumn({ name: 'group', label:'Groupe' }),
  new CsvColumn({ name: 'studyScheme', label:'Régime' }),
  new CsvColumn({ name: 'birthdate', label:'Date de naissance (jj/mm/aaaa)', isRequired: true, isDate: true }),
];

class HigherSchoolingRegistrationParser extends CsvRegistrationParser {

  constructor(input, organizationId) {
    super(input, organizationId, COLUMNS);
  }

  parse() {
    const registrationSet = new HigherSchoolingRegistrationSet();
    return super.parse({
      registrationSet,
      onParseLineError: this._handleError,
    });
  }

  _handleError(err, index) {
    const column = COLUMNS.find((column) => column.name === err.key);
    if (err.why === 'uniqueness') {
      throw new CsvImportError(`Ligne ${index + 2} : Le champ “Numéro étudiant” doit être unique au sein du fichier.`);
    }
    if (err.why === 'max_length') {
      throw new CsvImportError(`Ligne ${index + 2} : Le champ “${column.label}” doit être inférieur à 255 caractères.`);
    }
    if (err.why === 'not_a_date' || err.why === 'date_format') {
      throw new CsvImportError(`Ligne ${index + 2} : Le champ “Date de naissance” doit être au format jj/mm/aaaa.`);
    }
    if (err.why === 'student_number_format') {
      throw new CsvImportError(`Ligne ${index + 2} : Le champ “numéro étudiant” ne doit pas avoir de caractères spéciaux.`);
    }
    if (err.why === 'required') {
      throw new CsvImportError(`Ligne ${index + 2} : Le champ “${column.label}” est obligatoire.`);
    }
    throw err;
  }
}

module.exports = HigherSchoolingRegistrationParser;

