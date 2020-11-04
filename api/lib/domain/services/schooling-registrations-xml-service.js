const { FileValidationError, SameNationalStudentIdInFileError } = require('../errors');
const fs = require('fs');
const iconv = require('iconv-lite');
const moment = require('moment');
const xml2js = require('xml2js');
const sax = require('sax');
const saxPath = require('saxpath');
const xmlEncoding = require('xml-buffer-tostring').xmlEncoding;
const { isEmpty, isNil, each, isUndefined } = require('lodash');

const DEFAULT_FILE_ENCODING = 'iso-8859-15';
const DIVISION = 'D';
const NODE_ORGANIZATION_UAI = '/BEE_ELEVES/PARAMETRES';
const NODES_SCHOOLING_REGISTRATIONS = '/BEE_ELEVES/DONNEES/*/*';
const ELEVE_ELEMENT = '<ELEVE';
const STRUCTURE_ELEVE_ELEMENT = '<STRUCTURES_ELEVE';
const NO_STUDENTS_IMPORTED_FROM_INVALID_FILE = 'Aucun élève n’a pu être importé depuis ce fichier. Vérifiez que le fichier est conforme.';
const UAI_SIECLE_FILE_NOT_MATCH_ORGANIZATION_UAI = 'Aucun étudiant n’a été importé. L’import n’est pas possible car l’UAI du fichier SIECLE ne correspond pas à celui de votre établissement. En cas de difficulté, contactez support.pix.fr.';

module.exports = {
  extractSchoolingRegistrationsInformationFromSIECLE,
};

async function extractSchoolingRegistrationsInformationFromSIECLE(path, organization) {
  const encoding = await _detectEncodingFromFirstLineOfSiecleFile(path);

  const UAIFromSIECLE = await _extractUAI(path, encoding);
  const UAIFromUserOrganization = organization.externalId;

  if (UAIFromSIECLE !== UAIFromUserOrganization) {
    throw new FileValidationError(UAI_SIECLE_FILE_NOT_MATCH_ORGANIZATION_UAI);
  }

  const schoolingRegistrations = await _processSiecleFile(path, encoding);

  return schoolingRegistrations.filter((schoolingRegistration) => !isUndefined(schoolingRegistration.division));
}

function _extractUAI(path, encoding) {
  return _withSiecleStream(path, encoding, _extractUAIFromStream);
}

async function _processSiecleFile(path, encoding) {
  return _withSiecleStream(path, encoding, _extractStudentRegistrationsFromStream);
}

async function _withSiecleStream(path, encoding, fn) {
  const rawStream = fs.createReadStream(path);
  const siecleFileStream = rawStream.pipe(iconv.decodeStream(encoding));

  try {
    return await fn(siecleFileStream);
  } finally {
    rawStream.close();
  }
}

function _extractUAIFromStream(siecleFileStream) {
  return new Promise(function(resolve, reject) {
    const saxParser = sax.createStream(true);
    saxParser.on('error', () => {
      reject(new FileValidationError('XML invalide'));
    });

    const streamerToParseOrganizationUAI = new saxPath.SaXPath(saxParser, NODE_ORGANIZATION_UAI);

    streamerToParseOrganizationUAI.once('match', (xmlNode) => {
      xml2js.parseString(xmlNode, (err, nodeData) => {
        if (err) return reject(err);
        if (nodeData.PARAMETRES) {
          const UAIFromSIECLE = _getValueFromParsedElement(nodeData.PARAMETRES.UAJ);
          resolve(UAIFromSIECLE);
        }
      });
    });

    saxParser.on('end', () => {
      reject(new FileValidationError(UAI_SIECLE_FILE_NOT_MATCH_ORGANIZATION_UAI));
    });

    siecleFileStream.pipe(saxParser);
  });
}

function _extractStudentRegistrationsFromStream(siecleFileStream) {
  return new Promise(function(resolve, reject_) {
    const saxParser = sax.createStream(true);
    saxParser.on('error', () => {
      reject(new FileValidationError(NO_STUDENTS_IMPORTED_FROM_INVALID_FILE));
    });

    const reject = (e) => {
      saxParser.removeAllListeners();
      return reject_(e);
    };

    const mapSchoolingRegistrationsByStudentId = new Map();
    const nationalStudentIds = [];

    const streamerToParseSchoolingRegistrations = new saxPath.SaXPath(saxParser, NODES_SCHOOLING_REGISTRATIONS);
    streamerToParseSchoolingRegistrations.on('match', (xmlNode) => {
      if (_isSchoolingRegistrationNode(xmlNode)) {
        xml2js.parseString(xmlNode, (err, nodeData) => {
          try {
            if (err) throw err;
            processStudentsNodes(mapSchoolingRegistrationsByStudentId, nodeData, nationalStudentIds);
            processStudentsStructureNodes(mapSchoolingRegistrationsByStudentId, nodeData);
          } catch (err) {
            reject(err);
          }
        });
      }
    });

    siecleFileStream.pipe(saxParser);

    streamerToParseSchoolingRegistrations.on('end', () => {
      resolve(Array.from(mapSchoolingRegistrationsByStudentId.values()));
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
    const lineEndingCharacter = '\n';
    const BOM = 0xFEFF;
    let value = '';
    let position = 0;
    let index;
    readStream.on('data', (chunk) => {
      index = chunk.indexOf(lineEndingCharacter);
      value += chunk;
      if (index === -1) {
        position += chunk.length;
      } else {
        position += index;
        readStream.close();
      }
    })
      .on('close', () => {
        const rawFirstLine = value;
        const lineStartsAt = rawFirstLine.charCodeAt(0) === BOM ? 1 : 0;
        const lineEndsAt = position;
        const firstLine = rawFirstLine.slice(lineStartsAt, lineEndsAt);
        resolve(firstLine);
      })
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

async function _detectEncodingFromFirstLineOfSiecleFile(path) {
  const firstLine = await _readFirstLineFromFile(path);
  return xmlEncoding(Buffer.from(firstLine)) || DEFAULT_FILE_ENCODING;
}

function processStudentsNodes(mapSchoolingRegistrationsByStudentId, nodeData, nationalStudentIds) {
  const studentData = nodeData.ELEVE;
  if (studentData && _isStudentEligible(studentData, mapSchoolingRegistrationsByStudentId)) {
    const nationalStudentId = _getValueFromParsedElement(nodeData.ELEVE.ID_NATIONAL);
    _throwIfNationalStudentIdIsDuplicatedInFile(nationalStudentId, nationalStudentIds);
    nationalStudentIds.push(nationalStudentId);
    mapSchoolingRegistrationsByStudentId.set(nodeData.ELEVE.$.ELEVE_ID, _mapStudentInformationToSchoolingRegistration(nodeData));
  }
}

function processStudentsStructureNodes(mapSchoolingRegistrationsByStudentId, nodeData) {
  if (nodeData.STRUCTURES_ELEVE && mapSchoolingRegistrationsByStudentId.has(nodeData.STRUCTURES_ELEVE.$.ELEVE_ID)) {
    const currentStudent = mapSchoolingRegistrationsByStudentId.get(nodeData.STRUCTURES_ELEVE.$.ELEVE_ID);
    const structureElement = nodeData.STRUCTURES_ELEVE.STRUCTURE;

    each(structureElement, (structure) => {
      if (structure.TYPE_STRUCTURE[0] === DIVISION && structure.CODE_STRUCTURE[0] !== 'Inactifs') {
        currentStudent.division = structure.CODE_STRUCTURE[0];
      }
    });
  }
}

function _throwIfNationalStudentIdIsDuplicatedInFile(nationalStudentId, nationalStudentIds) {
  if (nationalStudentId && nationalStudentIds.indexOf(nationalStudentId) !== -1) {
    throw new SameNationalStudentIdInFileError(nationalStudentId);
  }
}
