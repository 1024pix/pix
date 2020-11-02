const { FileValidationError, SameNationalStudentIdInFileError } = require('../errors');
const fs = require('fs');
const iconv = require('iconv-lite');
const moment = require('moment');
const xml2js = require('xml2js');
const saxParser = require('sax').createStream(true);
const saxPath = require('saxpath');
const xmlEncoding = require('xml-buffer-tostring').xmlEncoding;
const { isEmpty, isNil, each } = require('lodash');

const DEFAULT_FILE_ENCODING = 'iso-8859-15';
const DIVISION = 'D';
const NODE_ORGANIZATION_UAI = '/BEE_ELEVES/PARAMETRES';
const NODES_SCHOOLING_REGISTRATIONS = '/BEE_ELEVES/DONNEES/*/*';
const ELEVE_ELEMENT = '<ELEVE';
const STRUCTURE_ELEVE_ELEMENT = '<STRUCTURES_ELEVE';
const UAI_SIECLE_FILE_NOT_MATCH_ORGANIZATION_UAI = 'Aucun étudiant n’a été importé. L’import n’est pas possible car l’UAI du fichier SIECLE ne correspond pas à celui de votre établissement. En cas de difficulté, contactez support.pix.fr.';

module.exports = {
  extractSchoolingRegistrationsInformationFromSIECLE,
};

async function extractSchoolingRegistrationsInformationFromSIECLE(payload, organization) {

  const encoding = await _detectEncodingFromFirstLineOfSiecleFile(payload);

  return new Promise(function(resolve, reject) {
    const siecleFileStream = fs.createReadStream(payload.path).pipe(iconv.decodeStream(encoding));

    const streamerToParseOrganizationUAI = new saxPath.SaXPath(saxParser, NODE_ORGANIZATION_UAI);
    const streamerToParseSchoolingRegistrations = new saxPath.SaXPath(saxParser, NODES_SCHOOLING_REGISTRATIONS);

    const mapSchoolingRegistrationsByStudentId = new Map();
    const nationalStudentIds = [];

    streamerToParseOrganizationUAI.on('match', (xmlNode) => {
      xml2js.parseStringPromise(xmlNode).then((nodeData) => {
        if (nodeData.PARAMETRES) {
          const UAIFromSIECLE = _getValueFromParsedElement(nodeData.PARAMETRES.UAJ);
          _rejectIfUAISiecleFileNotMatchWithOrganizationUAI(UAIFromSIECLE, organization, reject);
        }
      });
    });

    streamerToParseSchoolingRegistrations.on('match', (xmlNode) => {
      if (_isSchoolingRegistrationNode(xmlNode)) {
        xml2js.parseStringPromise(xmlNode).then((nodeData) =>  {

          const studentData = nodeData.ELEVE;
          if (studentData && _isStudentEligible(studentData, mapSchoolingRegistrationsByStudentId)) {
            const nationalStudentId = _getValueFromParsedElement(nodeData.ELEVE.ID_NATIONAL);
            _rejectIfNationalStudentIdIsDuplicatedInFile(nationalStudentId, nationalStudentIds, reject);
            nationalStudentIds.push(nationalStudentId);
            mapSchoolingRegistrationsByStudentId.set(nodeData.ELEVE.$.ELEVE_ID, _mapStudentInformationToSchoolingRegistration(nodeData));
          }

          if (nodeData.STRUCTURES_ELEVE && mapSchoolingRegistrationsByStudentId.has(nodeData.STRUCTURES_ELEVE.$.ELEVE_ID)) {
            const currentStudent = mapSchoolingRegistrationsByStudentId.get(nodeData.STRUCTURES_ELEVE.$.ELEVE_ID);
            const structureElement = nodeData.STRUCTURES_ELEVE.STRUCTURE;

            each(structureElement, (structure) => {
              if (structure.TYPE_STRUCTURE[0] === DIVISION && structure.CODE_STRUCTURE[0] !== 'Inactifs') {
                currentStudent.division = structure.CODE_STRUCTURE[0];
              }
            });
            _deleteSchoolingRegistrationsWhenDivisionIsUndefined(currentStudent, mapSchoolingRegistrationsByStudentId, nodeData);
          }
        });
      }
    });

    siecleFileStream.pipe(saxParser);

    const filterSchoolingRegistrationsOnlyWithDivisionDefined = () => {
      resolve(Array.from(mapSchoolingRegistrationsByStudentId.values()).filter((schoolingRegistration) => schoolingRegistration.division !== undefined));
    };
    streamerToParseSchoolingRegistrations.on('end', filterSchoolingRegistrationsOnlyWithDivisionDefined);

    siecleFileStream.on('end', () => {

      saxParser.removeAllListeners();
      streamerToParseOrganizationUAI.removeAllListeners();
      streamerToParseSchoolingRegistrations.removeAllListeners();

    });
  });
}

function _mapStudentInformationToSchoolingRegistration(nodeData) {
  return {
    lastName: _getValueFromParsedElement(nodeData.ELEVE.NOM_DE_FAMILLE),
    preferredLastName: _getValueFromParsedElement(nodeData.ELEVE.NOM_USAGE),
    firstName: _getValueFromParsedElement(nodeData.ELEVE.PRENOM),
    middleName: _getValueFromParsedElement(nodeData.ELEVE.PRENOM2),
    thirdName: _getValueFromParsedElement(nodeData.ELEVE.PRENOM3),
    birthdate: moment(nodeData.ELEVE.DATE_NAISS, 'DD/MM/YYYY').format('YYYY-MM-DD') || null,
    birthCountryCode: _getValueFromParsedElement(nodeData.ELEVE.CODE_PAYS, null),
    birthProvinceCode: _getValueFromParsedElement(nodeData.ELEVE.CODE_DEPARTEMENT_NAISS),
    birthCityCode: _getValueFromParsedElement(nodeData.ELEVE.CODE_COMMUNE_INSEE_NAISS),
    birthCity: _getValueFromParsedElement(nodeData.ELEVE.VILLE_NAISS),
    MEFCode: _getValueFromParsedElement(nodeData.ELEVE.CODE_MEF),
    status: _getValueFromParsedElement(nodeData.ELEVE.CODE_STATUT),
    nationalStudentId: _getValueFromParsedElement(nodeData.ELEVE.ID_NATIONAL),
  };
}

async function _readFirstLineFromFile(path) {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(path);
    const lineEnding = '\n';
    const BOM = 0xFEFF;
    let value = '';
    let position = 0;
    let index;
    readStream.on('data', (chunk) => {
      index = chunk.indexOf(lineEnding);
      value += chunk;
      if (index === -1) {
        position += chunk.length;
      } else {
        position += index;
        readStream.close();
      }
    })
      .on('close', () => resolve(value.slice(value.charCodeAt(0) === BOM ? 1 : 0, position)))
      .on('error', reject);
  });
}

function _isSchoolingRegistrationNode(xmlNode) {
  return xmlNode.startsWith(ELEVE_ELEMENT) || xmlNode.startsWith(STRUCTURE_ELEVE_ELEMENT);
}

function _isStudentEligible(studentData, mapSchoolingRegistrationsByStudentId) {
  const isStudentNotLeftSchoolingRegistration = isEmpty(studentData.DATE_SORTIE);
  const isStudentNotYetArrivedSchoolingRegistration = !isEmpty(studentData.ID_NATIONAL);
  const isStudentNotDuplicatedInTheSIECLEFile = !mapSchoolingRegistrationsByStudentId.has(studentData.$.ELEVE_ID);
  return isStudentNotLeftSchoolingRegistration && isStudentNotYetArrivedSchoolingRegistration && isStudentNotDuplicatedInTheSIECLEFile;
}

function _getValueFromParsedElement(obj) {
  if (isNil(obj)) return null;
  return (Array.isArray(obj) && !isEmpty(obj)) ? obj[0] : obj;
}

function _rejectIfUAISiecleFileNotMatchWithOrganizationUAI(UAIFromSIECLE, organization, reject) {
  if (UAIFromSIECLE !== organization.externalId) {
    reject(new FileValidationError(UAI_SIECLE_FILE_NOT_MATCH_ORGANIZATION_UAI));
  }
}

function _deleteSchoolingRegistrationsWhenDivisionIsUndefined(currentStudent, mapSchoolingRegistrationsByStudentId, nodeData) {
  if (currentStudent.division === undefined) {
    mapSchoolingRegistrationsByStudentId.delete(nodeData.STRUCTURES_ELEVE.$.ELEVE_ID);
  }
}

async function _detectEncodingFromFirstLineOfSiecleFile(payload) {
  const firstLine = await _readFirstLineFromFile(payload.path);
  return xmlEncoding(Buffer.from(firstLine)) || DEFAULT_FILE_ENCODING;
}

function _rejectIfNationalStudentIdIsDuplicatedInFile(nationalStudentId, nationalStudentIds, reject) {
  if (nationalStudentId && nationalStudentIds.indexOf(nationalStudentId) !== -1) {
    reject(new SameNationalStudentIdInFileError(nationalStudentId));
  }
}
