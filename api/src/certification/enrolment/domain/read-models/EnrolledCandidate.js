/**
 * @typedef {import('../models/Subscription.js').Subscription} Subscription
 */
import _ from 'lodash';

import { SubscriptionTypes } from '../../../shared/domain/models/SubscriptionTypes.js';

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
    this.subscriptions = subscriptions;
  }

  findComplementarySubscriptionInfo() {
    return this.subscriptions.find((sub) => sub.type === SubscriptionTypes.COMPLEMENTARY);
  }
}
