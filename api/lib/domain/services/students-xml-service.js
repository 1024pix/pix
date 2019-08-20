const { DOMParser } = require('xmldom');
const xmlBufferToString = require('xml-buffer-tostring');
const moment = require('moment');
const _ = require('lodash');

module.exports = {
  extractStudentsInformations
};

function extractStudentsInformations(buffer) {
  const parsedXmlDom = _buildXmlDomFromBuffer(buffer);
  const xmlStudentsStructures = Array.from(parsedXmlDom.getElementsByTagName('STRUCTURES_ELEVE'));
  const xmlStudents = Array.from(parsedXmlDom.getElementsByTagName('ELEVE'));

  if (_.isEmpty(xmlStudents)) {
    return [];
  }

  return xmlStudents
    .filter((xmlStudent) => {
      const matchingXmlStudentStructure = _findMatchingXmlStudentStructure(xmlStudent, xmlStudentsStructures);
      return !_.isEmpty(matchingXmlStudentStructure);
    })
    .filter((xmlStudent) => {
      const matchingXmlStudentStructure = _findMatchingXmlStudentStructure(xmlStudent, xmlStudentsStructures);
      return _findStudentClass(matchingXmlStudentStructure) !== 'Inactifs';
    })
    .map((xmlStudent) => {
      const matchingXmlStudentStructure = _findMatchingXmlStudentStructure(xmlStudent, xmlStudentsStructures);

      const birthCountryCode = _getEitherElementValueOrNull(xmlStudent, 'CODE_PAYS');
      return {
        lastName: _getEitherElementValueOrNull(xmlStudent, 'NOM_DE_FAMILLE'),
        preferredName: _getEitherElementValueOrNull(xmlStudent, 'NOM_USAGE'),
        firstName: _getEitherElementValueOrNull(xmlStudent, 'PRENOM'),
        middleName: _getEitherElementValueOrNull(xmlStudent, 'PRENOM2'),
        thirdName: _getEitherElementValueOrNull(xmlStudent, 'PRENOM3'),
        birthdate: moment(_getEitherElementValueOrNull(xmlStudent, 'DATE_NAISS'), 'DD/MM/YYYY').format('YYYY-MM-DD'),
        birthCountryCode,
        birthProvinceCode: _getEitherElementValueOrNull(xmlStudent, 'CODE_DEPARTEMENT_NAISS'),
        birthCityCode: _getEitherElementValueOrNull(xmlStudent, 'CODE_COMMUNE_INSEE_NAISS'),
        birthCity: birthCountryCode !== '100' ? _getEitherElementValueOrNull(xmlStudent, 'VILLE_NAISS') : null,
        MEFCode: _getEitherElementValueOrNull(xmlStudent, 'CODE_MEF'),
        status: _getEitherElementValueOrNull(xmlStudent, 'CODE_STATUT'),
        nationalId: _getEitherElementValueOrNull(xmlStudent, 'ID_NATIONAL'),
        nationalStudentId: _getEitherElementValueOrNull(xmlStudent, 'INE_RNIE'),
        schoolClass: _findStudentClass(matchingXmlStudentStructure),
      };
    });
}

function _buildXmlDomFromBuffer(xmlBuffer) {
  const stringifiedXml = xmlBufferToString(xmlBuffer);
  return new DOMParser().parseFromString(stringifiedXml);
}

function _findMatchingXmlStudentStructure(xmlStudent, xmlStudentsStructures) {
  const xmlStudentId = xmlStudent.getAttributeNode('ELEVE_ID').nodeValue;
  return xmlStudentsStructures
    .find((xmlStudentStructure) => xmlStudentStructure.getAttributeNode('ELEVE_ID').nodeValue === xmlStudentId);
}

function _findStudentClass(matchingXmlStudentStructure) {
  return Array.from(matchingXmlStudentStructure.getElementsByTagName('TYPE_STRUCTURE'))
    .reduce((returnedValue, typeStructure, index) => {
      return returnedValue || _getValue(typeStructure) === 'D' ?
        _getValue(matchingXmlStudentStructure.getElementsByTagName('CODE_STRUCTURE')[index]) : null;
    }, null);
}

function _getEitherElementValueOrNull(xmlParentElement, tagName) {
  const element = xmlParentElement.getElementsByTagName(tagName)[0];

  return element && element.childNodes[0] ? _getValue(element) : null;
}

function _getValue(element) {
  return element.childNodes[0].nodeValue;
}
