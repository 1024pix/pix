const papa = require('papaparse');
const iconv = require('iconv-lite');
const HigherSchoolingRegistrationSet = require('../../../../lib/domain/models/HigherSchoolingRegistrationSet');
const { convertDateValue } = require('../../utils/date-utils');
const { CsvImportError } = require('../../../../lib/domain/errors');
const PARSING_OPTIONS = {
  header: true,
  skipEmptyLines: 'greedy',
  transform: (value) => {
    if (typeof value === 'string') {
      value = value.trim();
      return value.length ? value : undefined;
    }
    return value;
  },
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
  birthdate: 'Date de naissance (jj/mm/aaaa)',
};

class HigherSchoolingRegistrationParser {

  constructor(input, organizationId) {
    this._input = input;
    this._organizationId = organizationId;
  }

  parse() {
    const higherSchoolingRegistrationSet = new HigherSchoolingRegistrationSet();

    const encoding = this._getFileEncoding();
    const { registrationLines, fields } = this._parse(encoding);

    if (!encoding) {
      throw new CsvImportError('Encodage du fichier non supporté.');
    }

    this._checkColumns(fields);

    registrationLines.forEach((line, index) => {
      const registrationAttributes = this._lineToRegistrationAttributes(line);
      try {
        higherSchoolingRegistrationSet.addRegistration(registrationAttributes);
      } catch (err) {
        this._handleError(err, index);
      }
    });

    return higherSchoolingRegistrationSet;
  }

  /**
   * Identify which encoding has the given file.
   * To check it, we decode and parse the first line of the file with supported encodings.
   * If there is one with at least "First name" or "Student number" correctly parsed and decoded.
   */
  _getFileEncoding() {
    const supported_encodings = ['utf-8', 'win1252', 'macintosh'];
    const { firstName, studentNumber } = COLUMN_NAME_BY_ATTRIBUTE;
    for (const encoding of supported_encodings) {
      const decodedInput = iconv.decode(this._input, encoding);
      const { meta: { fields } } = papa.parse(decodedInput, { ...PARSING_OPTIONS, preview: 1 });
      if (fields.some((value) => value === firstName || value === studentNumber)) {
        return encoding;
      }
    }
  }

  _parse(encoding = 'utf8') {
    const decodedInput = iconv.decode(this._input, encoding);
    const { data: registrationLines, meta: { fields }, errors } = papa.parse(decodedInput, PARSING_OPTIONS);

    if (errors.length) {
      errors.forEach((error) => {
        if (error.type === 'Delimiter') {
          throw new CsvImportError('Le fichier doit être au format csv avec séparateur virgule ou point-virgule.');
        }
      });
    }

    return { registrationLines, fields };
  }

  _handleError(err, index) {
    const column = COLUMN_NAME_BY_ATTRIBUTE[err.key];
    if (err.why === 'uniqueness') {
      throw new CsvImportError(`Ligne ${index + 2} : Le champ “Numéro étudiant” doit être unique au sein du fichier.`);
    }
    if (err.why === 'max_length') {
      throw new CsvImportError(`Ligne ${index + 2} : Le champ “${column}” doit être inférieur à 255 caractères.`);
    }
    if (err.why === 'not_a_date' || err.why === 'date_format') {
      throw new CsvImportError(`Ligne ${index + 2} : Le champ “Date de naissance” doit être au format jj/mm/aaaa.`);
    }
    if (err.why === 'student_number_format') {
      throw new CsvImportError(`Ligne ${index + 2} : Le champ “numéro étudiant” ne doit pas avoir de caractères spéciaux.`);
    }
    if (err.why === 'required') {
      throw new CsvImportError(`Ligne ${index + 2} : Le champ “${column}” est obligatoire.`);
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

    registrationAttributes['birthdate'] =  this._buildBirthdateAttribute(line[COLUMN_NAME_BY_ATTRIBUTE.birthdate]);
    registrationAttributes['organizationId'] = this._organizationId;

    return registrationAttributes;
  }

  _checkColumns(columns) {
    const { firstName, lastName, birthdate, studentNumber } = COLUMN_NAME_BY_ATTRIBUTE;
    const requiredColumns = [firstName, lastName, birthdate, studentNumber];
    requiredColumns.forEach((column) => {
      if (!columns.includes(column)) {
        throw new CsvImportError(`La colonne "${column}" est obligatoire.`);
      }
    });
    const expectedColumns = Object.values(COLUMN_NAME_BY_ATTRIBUTE);
    if (columns.some((column) => !expectedColumns.includes(column))) {
      throw new CsvImportError('Les entêtes de colonnes doivent être identiques à celle du modèle.');
    }
  }

  _buildBirthdateAttribute(birthdate) {
    const convertedDate = convertDateValue({ dateString: birthdate, inputFormat: 'DD/MM/YYYY', alternativeInputFormat: 'DD/MM/YY', outputFormat: 'YYYY-MM-DD' });
    return convertedDate || birthdate;
  }

}

module.exports = HigherSchoolingRegistrationParser;

