/**
 * @typedef {import('../models/Subscription.js').Subscription} Subscription
 * @typedef {import('../models/Candidate.js').Candidate} Candidate
 */
import _ from 'lodash';

import { SUBSCRIPTION_TYPES } from '../../../shared/domain/constants.js';

/**
 * @deprecated please use Candidate model that has no differences with this model
 * @see {Candidate} domain model
 */
export class EnrolledCandidate {
  /**
   * @param {Object} params
   * @param {Array<Subscription>} params.subscriptions
   */
  constructor({
    id,
    createdAt,
    firstName,
    lastName,
    sex,
    birthPostalCode,
    birthINSEECode,
    birthCity,
    birthProvinceCode,
    birthCountry,
    email,
    resultRecipientEmail,
    externalId,
    birthdate,
    extraTimePercentage,
    sessionId,
    userId,
    organizationLearnerId,
    subscriptions,
    billingMode,
    prepaymentCode,
    accessibilityAdjustmentNeeded = false,
    hasSeenCertificationInstructions,
  } = {}) {
    this.id = id;
    this.createdAt = createdAt;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthCity = birthCity;
    this.birthProvinceCode = birthProvinceCode;
    this.birthCountry = birthCountry;
    this.birthPostalCode = birthPostalCode;
    this.birthINSEECode = birthINSEECode;
    this.sex = sex;
    this.email = email;
    this.resultRecipientEmail = resultRecipientEmail;
    this.externalId = externalId;
    this.birthdate = birthdate;
    this.extraTimePercentage = !_.isNil(extraTimePercentage) ? parseFloat(extraTimePercentage) : null;
    this.isLinked = Boolean(userId);
    this.userId = userId;
    this.sessionId = sessionId;
    this.organizationLearnerId = organizationLearnerId;
    this.billingMode = billingMode;
    this.prepaymentCode = prepaymentCode;
    this.hasSeenCertificationInstructions = hasSeenCertificationInstructions;
    this.subscriptions = subscriptions;
    this.accessibilityAdjustmentNeeded = accessibilityAdjustmentNeeded;
  }

  findComplementarySubscriptionInfo() {
    return this.subscriptions.find((sub) => sub.type === SUBSCRIPTION_TYPES.COMPLEMENTARY);
  }
}
