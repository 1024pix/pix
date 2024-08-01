/**
 * @typedef {import('../models/Candidate.js').Candidate} Candidate
 */
import _ from 'lodash';

import { SubscriptionTypes } from '../../../shared/domain/models/SubscriptionTypes.js';

export class EnrolledCandidate {
  constructor({
    id,
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
    isLinked,
    organizationLearnerId,
    subscriptions,
    billingMode,
    prepaymentCode,
  } = {}) {
    this.id = id;
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
    this.isLinked = !!isLinked;
    this.organizationLearnerId = organizationLearnerId;
    this.billingMode = billingMode;
    this.prepaymentCode = prepaymentCode;
    this.subscriptions = subscriptions;
  }

  findComplementarySubscriptionInfo() {
    return this.subscriptions.find((sub) => sub.type === SubscriptionTypes.COMPLEMENTARY);
  }
}
