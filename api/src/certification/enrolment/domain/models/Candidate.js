import _ from 'lodash';

import { CertificationCandidatesError } from '../../../../shared/domain/errors.js';
import { BILLING_MODES } from '../../../shared/domain/constants.js';
import { validate } from '../validators/candidate-validator.js';

export class Candidate {
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
    createdAt,
    authorizedToStart = false,
    sessionId,
    userId,
    reconciledAt,
    organizationLearnerId,
    billingMode,
    prepaymentCode,
    hasSeenCertificationInstructions = false,
    subscriptions = [],
    accessibilityAdjustmentNeeded,
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
    this.createdAt = createdAt;
    this.authorizedToStart = authorizedToStart;
    this.sessionId = sessionId;
    this.userId = userId;
    this.organizationLearnerId = organizationLearnerId;
    this.billingMode = billingMode;
    this.prepaymentCode = prepaymentCode;
    this.hasSeenCertificationInstructions = hasSeenCertificationInstructions;
    this.subscriptions = subscriptions;
    this.accessibilityAdjustmentNeeded = accessibilityAdjustmentNeeded;
    this.reconciledAt = reconciledAt;
  }

  isReconciled() {
    return !!this.userId && !!this.reconciledAt;
  }

  isReconciledTo(userId) {
    return this.isReconciled() && this.userId === userId;
  }

  /**
   * @deprecated please use isReconciledTo function
   */
  isLinkedTo(userId) {
    return this.userId === userId;
  }

  reconcile(userId) {
    this.userId = userId;
    this.reconciledAt = new Date();
  }

  updateAccessibilityAdjustmentNeededStatus(newAdjustmentStatus) {
    this.accessibilityAdjustmentNeeded = newAdjustmentStatus;
  }

  validateCertificationInstructions() {
    this.hasSeenCertificationInstructions = true;
  }

  validate({ isSco = false, cleaCertificationId = null, isCoreComplementaryCompatibilityEnabled = false } = {}) {
    const { error } = validate(this, {
      allowUnknown: true,
      context: {
        isSco,
        cleaCertificationId,
        isCoreComplementaryCompatibilityEnabled,
        isSessionsMassImport: false,
      },
    });

    if (error) {
      throw new CertificationCandidatesError({
        code: error.details?.[0]?.message,
        meta: error.details?.[0]?.context?.value,
      });
    }
  }

  validateForMassSessionImport(isSco = false) {
    const { error } = validate(this, {
      abortEarly: false,
      allowUnknown: true,
      context: {
        isSco,
        isSessionsMassImport: true,
      },
    });
    if (error) {
      return error.details.map(({ message }) => message);
    }
  }

  updateBirthInformation({ birthCountry, birthINSEECode, birthPostalCode, birthCity }) {
    this.birthCountry = birthCountry;
    this.birthINSEECode = birthINSEECode;
    this.birthPostalCode = birthPostalCode;
    this.birthCity = birthCity;
  }

  static parseBillingMode({ billingMode, translate }) {
    switch (billingMode) {
      case translate('candidate-list-template.billing-mode.free'):
        return BILLING_MODES.FREE;
      case translate('candidate-list-template.billing-mode.paid'):
        return BILLING_MODES.PAID;
      case translate('candidate-list-template.billing-mode.prepaid'):
        return BILLING_MODES.PREPAID;
      case null:
      default:
        return '';
    }
  }

  convertExtraTimePercentageToDecimal() {
    this.extraTimePercentage = this.extraTimePercentage / 100;
  }

  hasCoreSubscription() {
    return this.subscriptions.some((subscription) => subscription.isCore());
  }
}
