const { DOMParser } = require('xmldom');
const xmlBufferToString = require('xml-buffer-tostring');
const moment = require('moment');
const _ = require('lodash');

module.exports = {
  extractStudentsInformationFromSIECLE
};

function extractStudentsInformationFromSIECLE(buffer) {
  const parsedXmlDom = _buildXmlDomFromBuffer(buffer);

  if (_.isEmpty(parsedXmlDom)) {
    return [];
  }

  const xmlStudentsStructures = Array.from(parsedXmlDom.getElementsByTagName('STRUCTURES_ELEVE'));
  const xmlStudents = Array.from(parsedXmlDom.getElementsByTagName('ELEVE'));

  return xmlStudents
    .filter((xmlStudent) => {
      const studentStructuresContainer = _findStudentStructures(xmlStudent, xmlStudentsStructures);

      return !_.isEmpty(studentStructuresContainer) && !_.isEmpty(_findStudentDivision(studentStructuresContainer)) && _findStudentDivision(studentStructuresContainer) !== 'Inactifs';
    })
    .filter((xmlStudent) => {
      const nationalStudentId = _getEitherElementValueOrNull(xmlStudent, 'ID_NATIONAL');
      return !_.isEmpty(nationalStudentId);
    })
    .map((xmlStudent) => {
      const studentStructuresContainer = _findStudentStructures(xmlStudent, xmlStudentsStructures);

      const birthCountryCode = _getEitherElementValueOrNull(xmlStudent, 'CODE_PAYS');
      return {
        lastName: _getEitherElementValueOrNull(xmlStudent, 'NOM_DE_FAMILLE'),
        preferredLastName: _getEitherElementValueOrNull(xmlStudent, 'NOM_USAGE'),
        firstName: _getEitherElementValueOrNull(xmlStudent, 'PRENOM'),
        middleName: _getEitherElementValueOrNull(xmlStudent, 'PRENOM2'),
        thirdName: _getEitherElementValueOrNull(xmlStudent, 'PRENOM3'),
        birthdate: moment(_getEitherElementValueOrNull(xmlStudent, 'DATE_NAISS'), 'DD/MM/YYYY').format('YYYY-MM-DD'),
        birthCountryCode,
        birthProvinceCode: _getEitherElementValueOrNull(xmlStudent, 'CODE_DEPARTEMENT_NAISS'),
        birthCityCode: _getEitherElementValueOrNull(xmlStudent, 'CODE_COMMUNE_INSEE_NAISS'),
        birthCity: _getEitherElementValueOrNull(xmlStudent, 'VILLE_NAISS'),
        MEFCode: _getEitherElementValueOrNull(xmlStudent, 'CODE_MEF'),
        status: _getEitherElementValueOrNull(xmlStudent, 'CODE_STATUT'),
        nationalStudentId: _getEitherElementValueOrNull(xmlStudent, 'ID_NATIONAL'),
        division: _findStudentDivision(studentStructuresContainer),
      };
    });
}

function _buildXmlDomFromBuffer(xmlBuffer) {
  const stringifiedXml = xmlBufferToString(xmlBuffer);
  return new DOMParser().parseFromString(stringifiedXml);
}

function _findStudentStructures(xmlStudent, xmlStudentsStructures) {
  const xmlStudentId = xmlStudent.getAttribute('ELEVE_ID');
  return xmlStudentsStructures
    .find((xmlStudentStructure) => xmlStudentStructure.getAttribute('ELEVE_ID') === xmlStudentId);
}

function _findStudentDivision(studentStructuresContainer) {
  const divisionStructureElement = Array.from(studentStructuresContainer.getElementsByTagName('STRUCTURE'))
    .find((structureElement) => _getEitherElementValueOrNull(structureElement, 'TYPE_STRUCTURE') === 'D');

  if (!divisionStructureElement) {
    return null;
  }

  return _getEitherElementValueOrNull(divisionStructureElement, 'CODE_STRUCTURE');
}

function _getEitherElementValueOrNull(xmlParentElement, tagName) {
  const element = xmlParentElement.getElementsByTagName(tagName)[0];

  return element ? element.textContent : null;
}
