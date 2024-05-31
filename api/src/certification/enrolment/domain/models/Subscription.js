/**
 * @typedef {import ('../../../shared/domain/models/SubscriptionTypes.js').SubscriptionTypes} SubscriptionTypes
 */

import { SubscriptionTypes } from '../../../shared/domain/models/SubscriptionTypes.js';
import { validate } from '../../../shared/domain/validators/subscription-validator.js';

class Subscription {
  /**
   * @param {Object} params
   * @param {number} params.certificationCandidateId - identifier of the certification candidate
   * @param {SubscriptionTypes} params.type
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
    return new Subscription({ certificationCandidateId, type: SubscriptionTypes.CORE });
  }

  /**
   * @param {Object} params
   * @param {number} params.certificationCandidateId - identifier of the certification candidate
   * @param {number} params.complementaryCertificationId
   */
  static buildComplementary({ certificationCandidateId, complementaryCertificationId }) {
    return new Subscription({
      certificationCandidateId,
      type: SubscriptionTypes.COMPLEMENTARY,
      complementaryCertificationId,
    });
  }
}

export { Subscription };
