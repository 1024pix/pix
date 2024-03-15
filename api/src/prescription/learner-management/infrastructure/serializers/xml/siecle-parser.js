import isEmpty from 'lodash/isEmpty.js';
import isUndefined from 'lodash/isUndefined.js';
import saxPath from 'saxpath';
import xml2js from 'xml2js';

import { AggregateImportError, SiecleXmlImportError } from '../../../domain/errors.js';
import { XMLOrganizationLearnersSet } from './xml-organization-learner-set.js';

const ERRORS = {
  UAI_MISMATCHED: 'UAI_MISMATCHED',
};

const ELEVE_ELEMENT = '<ELEVE';
const STRUCTURE_ELEVE_ELEMENT = '<STRUCTURES_ELEVE';

class SiecleParser {
  constructor(siecleFileStreamer) {
    this.siecleFileStreamer = siecleFileStreamer;
    this.organizationLearnersSet = new XMLOrganizationLearnersSet();
    this._errors = [];
  }

  static create(siecleFileStreamer) {
    return new SiecleParser(siecleFileStreamer);
  }

  async parseUAJ(organizationUAJ) {
    try {
      await this.siecleFileStreamer.perform((stream, resolve) => {
        const streamerToParseOrganizationLearners = new saxPath.SaXPath(stream, '/BEE_ELEVES/PARAMETRES/UAJ');
        let isUAJNodeMissing = true;
        streamerToParseOrganizationLearners.once('match', (xmlNode) => {
          xml2js.parseString(xmlNode, (err, nodeData) => {
            isUAJNodeMissing = false;
            if (nodeData.UAJ === organizationUAJ) {
              resolve();
            }
            if (nodeData.UAJ !== organizationUAJ) {
              this._errors.push(new SiecleXmlImportError(ERRORS.UAI_MISMATCHED));
              resolve();
            }
            if (err) this._errors.push(err); // Si j'enleve cette ligne les tests passent organizationId
          });
        });
        streamerToParseOrganizationLearners.once('end', () => {
          if (isUAJNodeMissing) {
            this._errors.push(new SiecleXmlImportError(ERRORS.UAI_MISMATCHED));
          }
          resolve();
        });
      });
    } catch (err) {
      this._errors.push(err);
    }

    this.throwAllErrors();
  }

  async parse() {
    try {
      await this.siecleFileStreamer.perform((stream, resolve) => {
        const streamerToParseOrganizationLearners = new saxPath.SaXPath(stream, '/BEE_ELEVES/DONNEES/*/*');
        streamerToParseOrganizationLearners.on('match', (xmlNode) => {
          if (_isOrganizationLearnerNode(xmlNode)) {
            xml2js.parseString(xmlNode, (err, nodeData) => {
              try {
                let errors = [];
                if (_isNodeImportableStudent(nodeData)) {
                  errors = this.organizationLearnersSet.add(nodeData.ELEVE.$.ELEVE_ID, nodeData.ELEVE);
                } else if (_isNodeImportableStructures(nodeData, this.organizationLearnersSet)) {
                  this.organizationLearnersSet.updateDivision(nodeData);
                }

                if (errors.length > 0) this._errors.push(...errors);
                if (err) this._errors.push(err); // Si j'enleve cette ligne les tests passent
              } catch (err) {
                this._errors.push(err);
              }
            });
          }
        });

        streamerToParseOrganizationLearners.on('end', resolve);
      });
    } catch (err) {
      this._errors.push(err);
    }

    await this.siecleFileStreamer.close();

    this.throwAllErrors();

    return this.organizationLearnersSet.organizationLearners.filter(
      (organizationLearner) => !isUndefined(organizationLearner.division),
    );
  }

  throwAllErrors() {
    if (this._errors.length > 0) throw new AggregateImportError(this._errors);
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
