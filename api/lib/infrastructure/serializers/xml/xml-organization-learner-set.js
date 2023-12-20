import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
dayjs.extend(customParseFormat);

import lodash from 'lodash';
const { isEmpty, isNil, each } = lodash;

import { SiecleXmlImportError, SIECLE_ERRORS } from '../../../domain/errors.js';

const DIVISION = 'D';

const FRANCE_COUNTRY_CODE = '100';

class XMLOrganizationLearnersSet {
  constructor() {
    this.organizationLearnersByStudentId = new Map();
    this.studentIds = [];
  }

  add(id, xmlNode) {
    const nationalStudentId = _getValueFromParsedElement(xmlNode.ID_NATIONAL);

    this._check(xmlNode);
    this.studentIds.push(nationalStudentId);

    this.organizationLearnersByStudentId.set(id, _mapStudentInformationToOrganizationLearner(xmlNode));
  }

  updateDivision(xmlNode) {
    const currentStudent = this.organizationLearnersByStudentId.get(xmlNode.STRUCTURES_ELEVE.$.ELEVE_ID);
    const structureElement = xmlNode.STRUCTURES_ELEVE.STRUCTURE;

    each(structureElement, (structure) => {
      if (structure.TYPE_STRUCTURE[0] === DIVISION && structure.CODE_STRUCTURE[0] !== 'Inactifs') {
        currentStudent.division = structure.CODE_STRUCTURE[0];
      }
    });
  }

  _check(xmlNode) {
    const nationalStudentId = _getValueFromParsedElement(xmlNode.ID_NATIONAL);
    const sexCode = _getValueFromParsedElement(xmlNode.CODE_SEXE);
    const birthCountryCode = _getValueFromParsedElement(xmlNode.CODE_PAYS);
    const birthCityCode = _getValueFromParsedElement(xmlNode.CODE_COMMUNE_INSEE_NAISS);

    if (_frenchBornHasEmptyCityCode({ birthCountryCode, birthCityCode })) {
      throw new SiecleXmlImportError(SIECLE_ERRORS.BIRTH_CITY_CODE_REQUIRED_FOR_FR_STUDENT, { nationalStudentId });
    }
    if (isEmpty(sexCode)) {
      throw new SiecleXmlImportError(SIECLE_ERRORS.SEX_CODE_REQUIRED, { nationalStudentId });
    }
    if (isEmpty(nationalStudentId)) {
      throw new SiecleXmlImportError(SIECLE_ERRORS.INE_REQUIRED);
    }
    if (this.studentIds.includes(nationalStudentId)) {
      throw new SiecleXmlImportError(SIECLE_ERRORS.INE_UNIQUE, { nationalStudentId });
    }
  }

  has(studentId) {
    return this.organizationLearnersByStudentId.has(studentId);
  }

  get organizationLearners() {
    return Array.from(this.organizationLearnersByStudentId.values());
  }
}

function _mapStudentInformationToOrganizationLearner(studentNode) {
  const parsedBirthdate = studentNode.DATE_NAISS?.[0];

  return {
    lastName: _getValueFromParsedElement(studentNode.NOM_DE_FAMILLE),
    preferredLastName: _getValueFromParsedElement(studentNode.NOM_USAGE),
    firstName: _getValueFromParsedElement(studentNode.PRENOM),
    middleName: _getValueFromParsedElement(studentNode.PRENOM2),
    thirdName: _getValueFromParsedElement(studentNode.PRENOM3),
    sex: _convertSexCode(studentNode.CODE_SEXE),
    birthdate: dayjs(parsedBirthdate, 'DD/MM/YYYY').format('YYYY-MM-DD') || null,
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

function _frenchBornHasEmptyCityCode({ birthCountryCode, birthCityCode }) {
  return birthCountryCode === FRANCE_COUNTRY_CODE && isEmpty(birthCityCode);
}

export { XMLOrganizationLearnersSet };
