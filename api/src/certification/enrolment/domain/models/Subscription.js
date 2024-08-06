/**
 * @typedef {import ('../../../shared/domain/constants.js').SUBSCRIPTION_TYPES} SUBSCRIPTION_TYPES
 */

import { SUBSCRIPTION_TYPES } from '../../../shared/domain/constants.js';
import { validate } from '../../../shared/domain/validators/subscription-validator.js';

class Subscription {
  /**
   * @param {Object} params
   * @param {number} params.certificationCandidateId - identifier of the certification candidate
   * @param {SUBSCRIPTION_TYPES} params.type
   * @param {number} params.complementaryCertificationId
   */
  constructor({ certificationCandidateId, type, complementaryCertificationId }) {
    this.certificationCandidateId = certificationCandidateId;
    this.type = type;
    this.complementaryCertificationId = complementaryCertificationId;
    validate(this);
  }

  /**
   * @param {Object} params
   * @param {number} params.certificationCandidateId  - identifier of the certification candidate
   */
  static buildCore({ certificationCandidateId }) {
    return new Subscription({ certificationCandidateId, type: SUBSCRIPTION_TYPES.CORE });
  }

  /**
   * @param {Object} params
   * @param {number} params.certificationCandidateId - identifier of the certification candidate
   * @param {number} params.complementaryCertificationId
   */
  static buildComplementary({ certificationCandidateId, complementaryCertificationId }) {
    return new Subscription({
      certificationCandidateId,
      type: SUBSCRIPTION_TYPES.COMPLEMENTARY,
      complementaryCertificationId,
    });
  }
}

export { Subscription };
