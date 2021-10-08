const moment = require('moment');
const { isEmpty, isNil, each } = require('lodash');
const { SiecleXmlImportError } = require('../../../domain/errors');

const ERRORS = {
  INE_REQUIRED: 'INE_REQUIRED',
  INE_UNIQUE: 'INE_UNIQUE',
};
const DIVISION = 'D';

class XMLSchoolingRegistrationsSet {
  constructor() {
    this.schoolingRegistrationsByStudentId = new Map();
    this.studentIds = [];
  }

  add(id, xmlNode) {
    const nationalStudentId = _getValueFromParsedElement(xmlNode.ID_NATIONAL);
    this._checkNationalStudentIdUniqueness(nationalStudentId);
    this.studentIds.push(nationalStudentId);

    this.schoolingRegistrationsByStudentId.set(id, _mapStudentInformationToSchoolingRegistration(xmlNode));
  }

  updateDivision(xmlNode) {
    const currentStudent = this.schoolingRegistrationsByStudentId.get(xmlNode.STRUCTURES_ELEVE.$.ELEVE_ID);
    const structureElement = xmlNode.STRUCTURES_ELEVE.STRUCTURE;

    each(structureElement, (structure) => {
      if (structure.TYPE_STRUCTURE[0] === DIVISION && structure.CODE_STRUCTURE[0] !== 'Inactifs') {
        currentStudent.division = structure.CODE_STRUCTURE[0];
      }
    });
  }

  _checkNationalStudentIdUniqueness(nationalStudentId) {
    if (isEmpty(nationalStudentId)) {
      throw new SiecleXmlImportError(ERRORS.INE_REQUIRED);
    }
    if (this.studentIds.includes(nationalStudentId)) {
      throw new SiecleXmlImportError(ERRORS.INE_UNIQUE, { nationalStudentId });
    }
  }

  has(studentId) {
    return this.schoolingRegistrationsByStudentId.has(studentId);
  }

  get schoolingRegistrations() {
    return Array.from(this.schoolingRegistrationsByStudentId.values());
  }
}

function _mapStudentInformationToSchoolingRegistration(studentNode) {
  return {
    lastName: _getValueFromParsedElement(studentNode.NOM_DE_FAMILLE),
    preferredLastName: _getValueFromParsedElement(studentNode.NOM_USAGE),
    firstName: _getValueFromParsedElement(studentNode.PRENOM),
    middleName: _getValueFromParsedElement(studentNode.PRENOM2),
    thirdName: _getValueFromParsedElement(studentNode.PRENOM3),
    sex: _convertSexCode(studentNode.CODE_SEXE),
    birthdate: moment(studentNode.DATE_NAISS, 'DD/MM/YYYY').format('YYYY-MM-DD') || null,
    birthCountryCode: _getValueFromParsedElement(studentNode.CODE_PAYS),
    birthProvinceCode: _getValueFromParsedElement(studentNode.CODE_DEPARTEMENT_NAISS),
    birthCityCode: _getValueFromParsedElement(studentNode.CODE_COMMUNE_INSEE_NAISS),
    birthCity: _getValueFromParsedElement(studentNode.VILLE_NAISS),
    MEFCode: _getValueFromParsedElement(studentNode.CODE_MEF),
    status: _getValueFromParsedElement(studentNode.CODE_STATUT),
    nationalStudentId: _getValueFromParsedElement(studentNode.ID_NATIONAL),
  };
}

function _convertSexCode(obj) {
  const value = _getValueFromParsedElement(obj);
  if (value === '1') return 'M';
  if (value === '2') return 'F';
  return null;
}

function _getValueFromParsedElement(obj) {
  if (isNil(obj)) return null;
  return Array.isArray(obj) && !isEmpty(obj) ? obj[0] : obj;
}

module.exports = XMLSchoolingRegistrationsSet;
