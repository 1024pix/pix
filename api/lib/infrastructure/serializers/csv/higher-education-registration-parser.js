const papa = require('papaparse');
const _ = require('lodash');
const HigherEducationRegistrationSet = require('../../../../lib/domain/models/HigherEducationRegistrationSet');
const { convertDateValue } = require('../../utils/date-utils');
const { CsvStudentsImportError } = require('../../../../lib/domain/errors');
const PARSING_OPTIONS = {
  header: true,
  skipEmptyLines: 'greedy',
  transform: (value) => {
    if (typeof value === 'string') {
      value = value.trim();
      return value.length ? value : undefined;
    }
    return value;
  }
};
const COLUMN_NAME_BY_ATTRIBUTE = {
  firstName: 'Premier prénom',
  middleName: 'Deuxième prénom',
  thirdName: 'Troisième prénom',
  lastName: 'Nom de famille',
  preferredLastName: 'Nom d’usage',
  studentNumber: 'Numéro étudiant',
  email: 'Email',
  diploma: 'Diplôme',
  department: 'Composante',
  educationalTeam: 'Équipe pédagogique',
  group: 'Groupe',
  studyScheme: 'Régime',
  birthdate: 'Date de naissance (jj/mm/aaaa)'
};

class HigherEducationRegistrationParser {

  constructor(input, organizationId) {
    this._input = input.toString('utf8').replace(/^\uFEFF/, '');
    this._organizationId = organizationId;
  }

  parse() {
    const higherEducationRegistrationSet = new HigherEducationRegistrationSet();

    const { registrationLines, fields } = this._parse();

    this._checkColumns(fields);

    registrationLines.forEach((line, index) => {
      const registrationAttributes = this._lineToRegistrationAttributes(line);
      try {
        higherEducationRegistrationSet.addRegistration(registrationAttributes);
      } catch (err) {
        this._handleError(err, index);
      }
    });

    return higherEducationRegistrationSet;
  }

  _parse() {
    const { data: registrationLines, meta: { fields }, errors } = papa.parse(this._input, PARSING_OPTIONS);

    if (errors.length) {
      errors.forEach((error) => {
        if (error.type === 'Delimiter') {
          throw new CsvStudentsImportError('Le fichier doit être au format csv avec séparateur virgule ou point-virgule.');
        }
      });
    }
    return { registrationLines, fields };
  }

  _handleError(err, index) {
    const column = COLUMN_NAME_BY_ATTRIBUTE[err.key];
    if (err.why === 'uniqueness') {
      throw new CsvStudentsImportError(`Ligne ${index + 2} : Le champ “Numéro étudiant” doit être unique au sein du fichier.`);
    }
    if (err.why === 'max_length') {
      throw new CsvStudentsImportError(`Ligne ${index + 2} : Le champ “${column}” doit être inférieur à 255 caractères.`);
    }
    if (err.why === 'not_a_date' || err.why === 'date_format') {
      throw new CsvStudentsImportError(`Ligne ${index + 2} : Le champ “Date de naissance” doit être au format jj/mm/aaaa.`);
    }
    if (err.why === 'required') {
      throw new CsvStudentsImportError(`Ligne ${index + 2} : Le champ “${column}” est obligatoire.`);
    }
    throw err;
  }

  _lineToRegistrationAttributes(line) {
    const registrationAttributes = {};

    Object.keys(COLUMN_NAME_BY_ATTRIBUTE).map((attribute) => {
      const column = COLUMN_NAME_BY_ATTRIBUTE[attribute];
      const value = line[column];

      registrationAttributes[attribute] = value;
    });

    registrationAttributes['birthdate'] = convertDateValue({ dateString: line[COLUMN_NAME_BY_ATTRIBUTE.birthdate], inputFormat: 'DD/MM/YYYY', alternativeInputFormat: 'DD/MM/YY', outputFormat: 'YYYY-MM-DD' });
    registrationAttributes['organizationId'] = this._organizationId;

    return registrationAttributes;
  }

  _checkColumns(columns) {
    const expectedColumns = Object.values(COLUMN_NAME_BY_ATTRIBUTE).sort();
    if (!_.isEqual(expectedColumns, columns.sort())) {
      throw new CsvStudentsImportError('Les entêtes de colonnes doivent être identiques à celle du modèle.');
    }
  }

}

module.exports = HigherEducationRegistrationParser;

