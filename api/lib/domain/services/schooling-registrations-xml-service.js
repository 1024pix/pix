const { DOMParser } = require('xmldom');
const xmlBufferToString = require('xml-buffer-tostring');
const moment = require('moment');
const _ = require('lodash');

module.exports = {
  extractSchoolingRegistrationsInformationFromSIECLE
};

function extractSchoolingRegistrationsInformationFromSIECLE(buffer) {
  const parsedXmlDom = _buildXmlDomFromBuffer(buffer);

  if (_.isEmpty(parsedXmlDom)) {
    return [];
  }

  const xmlSchoolingRegistrationsStructures = Array.from(parsedXmlDom.getElementsByTagName('STRUCTURES_ELEVE'));
  const xmlSchoolingRegistrations = Array.from(parsedXmlDom.getElementsByTagName('ELEVE'));

  return xmlSchoolingRegistrations
    .filter((xmlSchoolingRegistration) => _filterLeftSchoolingRegistrations(xmlSchoolingRegistration, xmlSchoolingRegistrationsStructures))
    .filter((xmlSchoolingRegistration) => _filterNotYetArrivedSchoolingRegistrations(xmlSchoolingRegistration))
    .map((xmlSchoolingRegistration) => {
      const schoolingRegistrationStructuresContainer = _findSchoolingRegistrationStructures(xmlSchoolingRegistration, xmlSchoolingRegistrationsStructures);

      const birthCountryCode = _getEitherElementValueOrNull(xmlSchoolingRegistration, 'CODE_PAYS');
      return {
        lastName: _getEitherElementValueOrNull(xmlSchoolingRegistration, 'NOM_DE_FAMILLE'),
        preferredLastName: _getEitherElementValueOrNull(xmlSchoolingRegistration, 'NOM_USAGE'),
        firstName: _getEitherElementValueOrNull(xmlSchoolingRegistration, 'PRENOM'),
        middleName: _getEitherElementValueOrNull(xmlSchoolingRegistration, 'PRENOM2'),
        thirdName: _getEitherElementValueOrNull(xmlSchoolingRegistration, 'PRENOM3'),
        birthdate: moment(_getEitherElementValueOrNull(xmlSchoolingRegistration, 'DATE_NAISS'), 'DD/MM/YYYY').format('YYYY-MM-DD'),
        birthCountryCode,
        birthProvinceCode: _getEitherElementValueOrNull(xmlSchoolingRegistration, 'CODE_DEPARTEMENT_NAISS'),
        birthCityCode: _getEitherElementValueOrNull(xmlSchoolingRegistration, 'CODE_COMMUNE_INSEE_NAISS'),
        birthCity: _getEitherElementValueOrNull(xmlSchoolingRegistration, 'VILLE_NAISS'),
        MEFCode: _getEitherElementValueOrNull(xmlSchoolingRegistration, 'CODE_MEF'),
        status: _getEitherElementValueOrNull(xmlSchoolingRegistration, 'CODE_STATUT'),
        nationalStudentId: _getEitherElementValueOrNull(xmlSchoolingRegistration, 'ID_NATIONAL'),
        division: _findSchoolingRegistrationDivision(schoolingRegistrationStructuresContainer),
      };
    });
}

function _buildXmlDomFromBuffer(xmlBuffer) {
  const stringifiedXml = xmlBufferToString(xmlBuffer);
  return new DOMParser().parseFromString(stringifiedXml);
}

function _findSchoolingRegistrationStructures(xmlSchoolingRegistration, xmlSchoolingRegistrationsStructures) {
  const xmlSchoolingRegistrationId = xmlSchoolingRegistration.getAttribute('ELEVE_ID');
  return xmlSchoolingRegistrationsStructures
    .find((xmlSchoolingRegistrationStructure) => xmlSchoolingRegistrationStructure.getAttribute('ELEVE_ID') === xmlSchoolingRegistrationId);
}

function _findSchoolingRegistrationDivision(schoolingRegistrationStructuresContainer) {
  if (_.isEmpty(schoolingRegistrationStructuresContainer)) {
    return null;
  }
  const divisionStructureElement = Array.from(schoolingRegistrationStructuresContainer.getElementsByTagName('STRUCTURE'))
    .find((structureElement) => _getEitherElementValueOrNull(structureElement, 'TYPE_STRUCTURE') === 'D');

  return divisionStructureElement ? _getEitherElementValueOrNull(divisionStructureElement, 'CODE_STRUCTURE') : null;
}

function _filterLeftSchoolingRegistrations(xmlSchoolingRegistration, xmlSchoolingRegistrationsStructures) {
  const leavingDate = _getEitherElementValueOrNull(xmlSchoolingRegistration, 'DATE_SORTIE');
  return _.isEmpty(leavingDate) && _filterSchoolingRegistrationsWithNoDivision(xmlSchoolingRegistration, xmlSchoolingRegistrationsStructures);
}

function _filterSchoolingRegistrationsWithNoDivision(xmlSchoolingRegistration, xmlSchoolingRegistrationsStructures) {
  const schoolingRegistrationStructuresContainer = _findSchoolingRegistrationStructures(xmlSchoolingRegistration, xmlSchoolingRegistrationsStructures);
  const schoolingRegistrationDivision = _findSchoolingRegistrationDivision(schoolingRegistrationStructuresContainer);
  return !_.isEmpty(schoolingRegistrationDivision) && schoolingRegistrationDivision !== 'Inactifs';
}

function _filterNotYetArrivedSchoolingRegistrations(xmlSchoolingRegistration) {
  const nationalSchoolingRegistrationId = _getEitherElementValueOrNull(xmlSchoolingRegistration, 'ID_NATIONAL');
  return !_.isEmpty(nationalSchoolingRegistrationId);
}

function _getEitherElementValueOrNull(xmlParentElement, tagName) {
  const element = xmlParentElement.getElementsByTagName(tagName)[0];

  return element ? element.textContent : null;
}
