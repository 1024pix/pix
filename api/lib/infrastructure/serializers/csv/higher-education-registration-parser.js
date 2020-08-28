const { parse } = require('./csv-parser');
const HigherEducationRegistrationSet = require('../../../../lib/domain/models/HigherEducationRegistrationSet');
const { convertDateValue } = require('../../utils/date-utils');

const columnNameByAttribute = {
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
    this._input = input;
    this._organizationId = organizationId;
  }

  parse() {
    const higherEducationRegistrationSet = new HigherEducationRegistrationSet();

    const registrationLines = parse(this._input);

    registrationLines.forEach((line) => {
      const registrationAttributes = this._lineToRegistrationAttributes(line);
      higherEducationRegistrationSet.addRegistration(registrationAttributes);
    });

    return higherEducationRegistrationSet;
  }

  _lineToRegistrationAttributes(line) {
    const registrationAttributes = {};

    Object.keys(columnNameByAttribute).map((attribute) => {
      const column = columnNameByAttribute[attribute];
      registrationAttributes[attribute] = line[column];
    });

    registrationAttributes['birthdate'] = convertDateValue({ dateString: line[columnNameByAttribute.birthdate], inputFormat: 'DD/MM/YYYY', alternativeInputFormat: 'DD/MM/YY', outputFormat: 'YYYY-MM-DD' });
    registrationAttributes['organizationId'] = this._organizationId;

    return registrationAttributes;
  }
}

module.exports = HigherEducationRegistrationParser;

