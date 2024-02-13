import { SiecleXmlImportError } from '../../../domain/errors.js';
import xml2js from 'xml2js';
import saxPath from 'saxpath';

import lodash from 'lodash';

const { isEmpty, isUndefined } = lodash;
import { XMLOrganizationLearnersSet } from './xml-organization-learner-set.js';

const ERRORS = {
  UAI_MISMATCHED: 'UAI_MISMATCHED',
};

const ELEVE_ELEMENT = '<ELEVE';
const STRUCTURE_ELEVE_ELEMENT = '<STRUCTURES_ELEVE';

class SiecleParser {
  constructor(organization, siecleFileStreamer) {
    this.siecleFileStreamer = siecleFileStreamer;
    this.organizationLearnersSet = new XMLOrganizationLearnersSet();
  }

  static create(organization, siecleFileStreamer) {
    return new SiecleParser(organization, siecleFileStreamer);
  }

  async parseUAJ(organisationId) {
    await this.siecleFileStreamer.perform((stream, resolve, reject) => {
      const streamerToParseOrganizationLearners = new saxPath.SaXPath(stream, '/BEE_ELEVES/PARAMETRES/UAJ');
      streamerToParseOrganizationLearners.once('match', (xmlNode) => {
        xml2js.parseString(xmlNode, (err, nodeData) => {
          if (err) return reject(err); // Si j'enleve cette ligne les tests passentorganisationId
          if (nodeData.UAJ !== organisationId) {
            reject(new SiecleXmlImportError(ERRORS.UAI_MISMATCHED));
          } else {
            resolve();
          }
        });
      });
      streamerToParseOrganizationLearners.once('end', () => {
        reject(new SiecleXmlImportError(ERRORS.UAI_MISMATCHED));
      });
    });
  }

  async parse() {
    await this.siecleFileStreamer.perform((stream, resolve, reject) => {
      const streamerToParseOrganizationLearners = new saxPath.SaXPath(stream, '/BEE_ELEVES/DONNEES/*/*');
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
    });

    await this.siecleFileStreamer.close();

    return this.organizationLearnersSet.organizationLearners.filter(
      (organizationLearner) => !isUndefined(organizationLearner.division),
    );
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

export { SiecleParser };
