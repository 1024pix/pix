/**
 * @typedef {import('../../../shared/domain/models/CertificationChallengeLiveAlert.js').CertificationChallengeLiveAlert} CertificationChallengeLiveAlert
 */

import { CertificationCandidateForSupervising } from './CertificationCandidateForSupervising.js';

/**
 * @typedef {Object} CertificationCandidateForSupervisingV3
 * @property {number} id
 * @property {number} userId
 * @property {string} firstName
 * @property {string} lastName
 * @property {date} birthdate
 * @property {number} extraTimePercentage
 * @property {boolean} authorizedToStart
 * @property {date} startDateTime
 * @property {date} theoricalEndDateTime
 * @property {CertificationChallengeLiveAlert} liveAlert
 */
export class CertificationCandidateForSupervisingV3 extends CertificationCandidateForSupervising {
  /**
   * @param {Object} props
   * @param {CertificationChallengeLiveAlert} props.liveAlert
   */
  constructor({ liveAlert = null, ...rest }) {
    super({ ...rest });
    this.liveAlert = liveAlert?.status ? liveAlert : null;
  }
}
