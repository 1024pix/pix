const { SiecleXmlImportError } = require('../../../domain/errors.js');
const xml2js = require('xml2js');
const saxPath = require('saxpath');
const { isEmpty, isUndefined } = require('lodash');
const SiecleFileStreamer = require('../../utils/xml/siecle-file-streamer.js');
const XMLOrganizationLearnerSet = require('./xml-organization-learner-set.js');

const ERRORS = {
  UAI_MISMATCHED: 'UAI_MISMATCHED',
};

const NODE_ORGANIZATION_UAI = '/BEE_ELEVES/PARAMETRES/UAJ';
const NODES_ORGANIZATION_LEARNERS = '/BEE_ELEVES/DONNEES/*/*';
const ELEVE_ELEMENT = '<ELEVE';
const STRUCTURE_ELEVE_ELEMENT = '<STRUCTURES_ELEVE';

class SiecleParser {
  constructor(organization, path) {
    this.organization = organization;
    this.path = path;
    this.organizationLearnersSet = new XMLOrganizationLearnerSet();
  }

  async parse() {
    this.siecleFileStreamer = await SiecleFileStreamer.create(this.path);

    await this._parseUAI();

    await this._parseStudents();

    await this.siecleFileStreamer.close();

    return this.organizationLearnersSet.organizationLearners.filter(
      (organizationLearner) => !isUndefined(organizationLearner.division)
    );
  }

  async _parseUAI() {
    await this.siecleFileStreamer.perform((stream, resolve, reject) => this._checkUAI(stream, resolve, reject));
  }

  async _checkUAI(stream, resolve, reject) {
    const streamerToParseOrganizationUAI = new saxPath.SaXPath(stream, NODE_ORGANIZATION_UAI);

    streamerToParseOrganizationUAI.once('match', (xmlNode) => {
      xml2js.parseString(xmlNode, (err, nodeData) => {
        if (err) return reject(err); // Si j'enleve cette ligne les tests passent
        const UAIFromUserOrganization = this.organization.externalId;
        if (nodeData.UAJ !== UAIFromUserOrganization) {
          reject(new SiecleXmlImportError(ERRORS.UAI_MISMATCHED));
        } else {
          resolve();
        }
      });
    });

    stream.on('end', () => {
      reject(new SiecleXmlImportError(ERRORS.UAI_MISMATCHED));
    });
  }

  async _parseStudents() {
    await this.siecleFileStreamer.perform((stream, resolve, reject) =>
      this._extractOrganizationLearnersFromStream(stream, resolve, reject)
    );
  }

  _extractOrganizationLearnersFromStream(saxParser, resolve, reject) {
    const streamerToParseOrganizationLearners = new saxPath.SaXPath(saxParser, NODES_ORGANIZATION_LEARNERS);
    streamerToParseOrganizationLearners.on('match', (xmlNode) => {
      if (_isOrganizationLearnerNode(xmlNode)) {
        xml2js.parseString(xmlNode, (err, nodeData) => {
          try {
            if (err) throw err; // Si j'enleve cette ligne les tests passent

            if (_isNodeImportableStudent(nodeData)) {
              this.organizationLearnersSet.add(nodeData.ELEVE.$.ELEVE_ID, nodeData.ELEVE);
            } else if (_isNodeImportableStructures(nodeData, this.organizationLearnersSet)) {
              this.organizationLearnersSet.updateDivision(nodeData);
            }
          } catch (err) {
            reject(err);
          }
        });
      }
    });

    streamerToParseOrganizationLearners.on('end', resolve);
  }
}

function _isOrganizationLearnerNode(xmlNode) {
  return xmlNode.startsWith(ELEVE_ELEMENT) || xmlNode.startsWith(STRUCTURE_ELEVE_ELEMENT);
}

function _isNodeImportableStudent(nodeData) {
  return nodeData.ELEVE && _isImportable(nodeData.ELEVE);
}

function _isNodeImportableStructures(nodeData, organizationLearnersSet) {
  return nodeData.STRUCTURES_ELEVE && organizationLearnersSet.has(nodeData.STRUCTURES_ELEVE.$.ELEVE_ID);
}

function _isImportable(studentData) {
  const isStudentNotLeftOrganizationLearner = isEmpty(studentData.DATE_SORTIE);
  const isStudentNotYetArrivedOrganizationLearner = !isEmpty(studentData.ID_NATIONAL);
  return isStudentNotLeftOrganizationLearner && isStudentNotYetArrivedOrganizationLearner;
}

module.exports = SiecleParser;
