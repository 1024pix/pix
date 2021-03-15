const { FileValidationError } = require('../../../domain/errors');
const xml2js = require('xml2js');
const saxPath = require('saxpath');
const { isEmpty, isUndefined } = require('lodash');
const SiecleFileStreamer = require('../../utils/xml/siecle-file-streamer');
const XMLSchoolingRegistrationSet = require('./xml-schooling-registration-set');

const ERRORS = {
  UAI_MISMATCHED: 'UAI_MISMATCHED',
};

const NODE_ORGANIZATION_UAI = '/BEE_ELEVES/PARAMETRES/UAJ';
const NODES_SCHOOLING_REGISTRATIONS = '/BEE_ELEVES/DONNEES/*/*';
const ELEVE_ELEMENT = '<ELEVE';
const STRUCTURE_ELEVE_ELEMENT = '<STRUCTURES_ELEVE';

class SiecleParser {
  constructor(organization, path) {
    this.organization = organization;
    this.path = path;
    this.schoolingRegistrationsSet = new XMLSchoolingRegistrationSet();
  }

  async parse() {

    this.siecleFileStreamer = await SiecleFileStreamer.create(this.path);

    await this._parseUAI();

    await this._parseStudents();

    return this.schoolingRegistrationsSet.schoolingRegistrations.filter((schoolingRegistration) => !isUndefined(schoolingRegistration.division));
  }

  async _parseUAI() {
    await this.siecleFileStreamer.perform((stream, resolve, reject) => this._checkUAI(stream, resolve, reject));
  }

  async _checkUAI(stream, resolve, reject) {
    const streamerToParseOrganizationUAI = new saxPath.SaXPath(stream, NODE_ORGANIZATION_UAI);

    streamerToParseOrganizationUAI.once('match', (xmlNode) => {
      xml2js.parseString(xmlNode, (err, nodeData) => {
        if (err) return reject(err);// Si j'enleve cette ligne les tests passent
        const UAIFromUserOrganization = this.organization.externalId;
        if (nodeData.UAJ !== UAIFromUserOrganization) {
          reject(new FileValidationError(UAI_SIECLE_FILE_NOT_MATCH_ORGANIZATION_UAI));
        } else {
          resolve();
        }
      });
    });

    stream.on('end', () => {
      reject(new FileValidationError(UAI_SIECLE_FILE_NOT_MATCH_ORGANIZATION_UAI));
    });
  }

  async _parseStudents() {
    await this.siecleFileStreamer.perform((stream, resolve, reject) => this._extractStudentRegistrationsFromStream(stream, resolve, reject));
  }

  _extractStudentRegistrationsFromStream(saxParser, resolve, reject) {
    const streamerToParseSchoolingRegistrations = new saxPath.SaXPath(saxParser, NODES_SCHOOLING_REGISTRATIONS);
    streamerToParseSchoolingRegistrations.on('match', (xmlNode) => {
      if (_isSchoolingRegistrationNode(xmlNode)) {
        xml2js.parseString(xmlNode, (err, nodeData) => {
          try {
            if (err) throw err;// Si j'enleve cette ligne les tests passent

            if (_isNodeImportableStudent(nodeData)) {
              this.schoolingRegistrationsSet.add(nodeData.ELEVE.$.ELEVE_ID, nodeData.ELEVE);
            } else if (_isNodeImportableStructures(nodeData, this.schoolingRegistrationsSet)) {
              this.schoolingRegistrationsSet.updateDivision(nodeData);
            }
          } catch (err) {
            reject(err);
          }
        });
      }
    });

    streamerToParseSchoolingRegistrations.on('end', resolve);
  }
}

function _isSchoolingRegistrationNode(xmlNode) {
  return xmlNode.startsWith(ELEVE_ELEMENT) || xmlNode.startsWith(STRUCTURE_ELEVE_ELEMENT);
}

function _isNodeImportableStudent(nodeData) {
  return nodeData.ELEVE && _isImportable(nodeData.ELEVE);
}

function _isNodeImportableStructures(nodeData, schoolingRegistrationsSet) {
  return nodeData.STRUCTURES_ELEVE && schoolingRegistrationsSet.has(nodeData.STRUCTURES_ELEVE.$.ELEVE_ID);
}

function _isImportable(studentData) {
  const isStudentNotLeftSchoolingRegistration = isEmpty(studentData.DATE_SORTIE);
  const isStudentNotYetArrivedSchoolingRegistration = !isEmpty(studentData.ID_NATIONAL);
  return isStudentNotLeftSchoolingRegistration && isStudentNotYetArrivedSchoolingRegistration;
}

module.exports = SiecleParser;
