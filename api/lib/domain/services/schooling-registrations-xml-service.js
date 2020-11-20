const { FileValidationError, SameNationalStudentIdInFileError } = require('../errors');
const moment = require('moment');
const xml2js = require('xml2js');
const saxPath = require('saxpath');
const { isEmpty, isNil, each, isUndefined, noop } = require('lodash');

const DIVISION = 'D';
const NODE_ORGANIZATION_UAI = '/BEE_ELEVES/PARAMETRES';
const NODES_SCHOOLING_REGISTRATIONS = '/BEE_ELEVES/DONNEES/*/*';
const ELEVE_ELEMENT = '<ELEVE';
const STRUCTURE_ELEVE_ELEMENT = '<STRUCTURES_ELEVE';
const NO_STUDENTS_IMPORTED_FROM_INVALID_FILE = 'Aucun élève n’a pu être importé depuis ce fichier. Vérifiez que le fichier est conforme.';
const UAI_SIECLE_FILE_NOT_MATCH_ORGANIZATION_UAI = 'Aucun étudiant n’a été importé. L’import n’est pas possible car l’UAI du fichier SIECLE ne correspond pas à celui de votre établissement. En cas de difficulté, contactez support.pix.fr.';

const XMLStreamer = require('../../infrastructure/utils/xml/xml-streamer');

let XmlStreamer;

class SiecleParser {
  constructor(organization) {
    this.organization = organization;
  }

  async parse() {

    await this._checkUAI();

    const schoolingRegistrations = await this._parseStudent();

    return schoolingRegistrations.filter((schoolingRegistration) => !isUndefined(schoolingRegistration.division));
  }

  async _checkUAI() {
    const UAIFromSIECLE = await XmlStreamer.perform(_UAIextractor);
    const UAIFromUserOrganization = this.organization.externalId;

    if (UAIFromSIECLE !== UAIFromUserOrganization) {
      throw new FileValidationError(UAI_SIECLE_FILE_NOT_MATCH_ORGANIZATION_UAI);
    }
  }

  async _parseStudent() {
    return await XmlStreamer.perform(_registrationExtractor);
  }
}

module.exports = {
  extractSchoolingRegistrationsInformationFromSIECLE,
};

async function extractSchoolingRegistrationsInformationFromSIECLE(path, organization) {
  XmlStreamer = await XMLStreamer.create(path)
  parser = new SiecleParser(organization)

  return parser.parse();
}

function _UAIextractor(saxParser, resolve, reject) {
  const streamerToParseOrganizationUAI = new saxPath.SaXPath(saxParser, NODE_ORGANIZATION_UAI);

  streamerToParseOrganizationUAI.once('match', (xmlNode) => {
    xml2js.parseString(xmlNode, (err, nodeData) => {
      if (err) return reject(err);
      if (nodeData.PARAMETRES) {
        resolve(nodeData.PARAMETRES.UAJ[0]);// Si je garde que cette ligne tous les tests passent

      }
    });
  });

  saxParser.on('end', () => {
    reject(new FileValidationError(UAI_SIECLE_FILE_NOT_MATCH_ORGANIZATION_UAI));
  });
}

function _registrationExtractor(saxParser, resolve, reject) {
  const mapSchoolingRegistrationsByStudentId = new Map();
  const nationalStudentIds = [];

  const streamerToParseSchoolingRegistrations = new saxPath.SaXPath(saxParser, NODES_SCHOOLING_REGISTRATIONS);

  streamerToParseSchoolingRegistrations.on('match', (xmlNode) => {
    if (_isSchoolingRegistrationNode(xmlNode)) {
      xml2js.parseString(xmlNode, (err, nodeData) => {
        try {
          if (err) throw err;// Si j'enleve cette ligne les tests passent

          if(nodeData.ELEVE && _isImportable(nodeData.ELEVE, mapSchoolingRegistrationsByStudentId)) {
            _processStudentsNodes(mapSchoolingRegistrationsByStudentId, nodeData.ELEVE, nationalStudentIds);
          }
          else if (nodeData.STRUCTURES_ELEVE && mapSchoolingRegistrationsByStudentId.has(nodeData.STRUCTURES_ELEVE.$.ELEVE_ID)) {
            _processStudentsStructureNodes(mapSchoolingRegistrationsByStudentId, nodeData);
          }
        } catch (err) {
          reject(err);
        }
      });
    }
  });

  streamerToParseSchoolingRegistrations.on('end', () => {
    resolve(Array.from(mapSchoolingRegistrationsByStudentId.values()));
  });
}

function _mapStudentInformationToSchoolingRegistration(studentNode) {
  return {
    lastName: _getValueFromParsedElement(studentNode.NOM_DE_FAMILLE),
    preferredLastName: _getValueFromParsedElement(studentNode.NOM_USAGE),
    firstName: _getValueFromParsedElement(studentNode.PRENOM),
    middleName: _getValueFromParsedElement(studentNode.PRENOM2),
    thirdName: _getValueFromParsedElement(studentNode.PRENOM3),
    birthdate: moment(studentNode.DATE_NAISS, 'DD/MM/YYYY').format('YYYY-MM-DD') || null,
    birthCountryCode: _getValueFromParsedElement(studentNode.CODE_PAYS, null),
    birthProvinceCode: _getValueFromParsedElement(studentNode.CODE_DEPARTEMENT_NAISS),
    birthCityCode: _getValueFromParsedElement(studentNode.CODE_COMMUNE_INSEE_NAISS),
    birthCity: _getValueFromParsedElement(studentNode.VILLE_NAISS),
    MEFCode: _getValueFromParsedElement(studentNode.CODE_MEF),
    status: _getValueFromParsedElement(studentNode.CODE_STATUT),
    nationalStudentId: _getValueFromParsedElement(studentNode.ID_NATIONAL),
  };
}

function _isSchoolingRegistrationNode(xmlNode) {
  return xmlNode.startsWith(ELEVE_ELEMENT) || xmlNode.startsWith(STRUCTURE_ELEVE_ELEMENT);
}

function _isImportable(studentData, mapSchoolingRegistrationsByStudentId) {
  const isStudentNotLeftSchoolingRegistration = isEmpty(studentData.DATE_SORTIE);
  const isStudentNotYetArrivedSchoolingRegistration = !isEmpty(studentData.ID_NATIONAL);
  const isStudentNotDuplicatedInTheSIECLEFile = !mapSchoolingRegistrationsByStudentId.has(studentData.$.ELEVE_ID);// Si je fais isStudentNotDuplicatedInTheSIECLEFile = true les tests passent
  return isStudentNotLeftSchoolingRegistration && isStudentNotYetArrivedSchoolingRegistration && isStudentNotDuplicatedInTheSIECLEFile;
}

function _getValueFromParsedElement(obj) {
  if (isNil(obj)) return null;
  return (Array.isArray(obj) && !isEmpty(obj)) ? obj[0] : obj;
}

function _processStudentsNodes(mapSchoolingRegistrationsByStudentId, studentNode, nationalStudentIds) {
  const nationalStudentId = _getValueFromParsedElement(studentNode.ID_NATIONAL);
  _throwIfNationalStudentIdIsDuplicatedInFile(nationalStudentId, nationalStudentIds);
  nationalStudentIds.push(nationalStudentId);
  mapSchoolingRegistrationsByStudentId.set(studentNode.$.ELEVE_ID, _mapStudentInformationToSchoolingRegistration(studentNode));
}

function _processStudentsStructureNodes(mapSchoolingRegistrationsByStudentId, nodeData) {
  const currentStudent = mapSchoolingRegistrationsByStudentId.get(nodeData.STRUCTURES_ELEVE.$.ELEVE_ID);
  const structureElement = nodeData.STRUCTURES_ELEVE.STRUCTURE;

  each(structureElement, (structure) => {
    if (structure.TYPE_STRUCTURE[0] === DIVISION && structure.CODE_STRUCTURE[0] !== 'Inactifs') {
      currentStudent.division = structure.CODE_STRUCTURE[0];
    }
  });
}

function _throwIfNationalStudentIdIsDuplicatedInFile(nationalStudentId, nationalStudentIds) {
  if (nationalStudentId && nationalStudentIds.indexOf(nationalStudentId) !== -1) {
    throw new SameNationalStudentIdInFileError(nationalStudentId);
  }
}
