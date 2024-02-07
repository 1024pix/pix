import { SiecleXmlImportError } from '../../../domain/errors.js';
import xml2js from 'xml2js';
import saxPath from 'saxpath';

import lodash from 'lodash';

const { isEmpty, isUndefined } = lodash;
import { XMLOrganizationLearnersSet } from './xml-organization-learner-set.js';

const ERRORS = {
  UAI_MISMATCHED: 'UAI_MISMATCHED',
};

const UAJ = '<UAJ';
const ELEVE_ELEMENT = '<ELEVE';
const STRUCTURE_ELEVE_ELEMENT = '<STRUCTURES_ELEVE';

class SiecleParser {
  constructor(organization, siecleFileStreamer) {
    this.organization = organization;
    this.siecleFileStreamer = siecleFileStreamer;
    this.organizationLearnersSet = new XMLOrganizationLearnersSet();

    this.hasCorrectUAJ = false;
  }

  static create(organization, siecleFileStreamer) {
    return new SiecleParser(organization, siecleFileStreamer);
  }

  async parse() {
    await this._parse();

    await this.siecleFileStreamer.close();

    // Prevent missing UAJ tag
    if (!this.hasCorrectUAJ) {
      throw new SiecleXmlImportError(ERRORS.UAI_MISMATCHED);
    }

    return this.organizationLearnersSet.organizationLearners.filter(
      (organizationLearner) => !isUndefined(organizationLearner.division),
    );
  }

  async _parse() {
    await this.siecleFileStreamer.perform((stream, resolve, reject) => {
      const streamerToParseOrganizationLearners = new saxPath.SaXPath(stream, '//*');
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
        } else if (_isUAJNode(xmlNode)) {
          xml2js.parseString(xmlNode, (err, nodeData) => {
            if (err) return reject(err); // Si j'enleve cette ligne les tests passent
            const UAIFromUserOrganization = this.organization.externalId;
            if (nodeData.UAJ !== UAIFromUserOrganization) {
              reject(new SiecleXmlImportError(ERRORS.UAI_MISMATCHED));
            } else {
              this.hasCorrectUAJ = true;
            }
          });
        }
      });

      streamerToParseOrganizationLearners.on('end', resolve);
    });
  }
}

function _isUAJNode(xmlNode) {
  return xmlNode.startsWith(UAJ);
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

export { SiecleParser };
