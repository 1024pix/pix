import lodash from 'lodash';

import { Subscription } from '../../../certification/enrolment/domain/models/Subscription.js';
import { BILLING_MODES, SUBSCRIPTION_TYPES } from '../../../certification/shared/domain/constants.js';

const { isNil } = lodash;

class CertificationCandidate {
  #complementaryCertification = null;

  /**
   * @param {Object} param
   * @param {Array<Subscription>} param.subscriptions {@link Subscription>}
   */
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
    organizationLearnerId = null,
    complementaryCertification = null,
    billingMode = null,
    prepaymentCode = null,
    subscriptions = [],
    hasSeenCertificationInstructions = false,
    accessibilityAdjustmentNeeded = false,
    reconciledAt,
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
    this.extraTimePercentage = !isNil(extraTimePercentage) ? parseFloat(extraTimePercentage) : extraTimePercentage;
    this.createdAt = createdAt;
    this.authorizedToStart = authorizedToStart;
    this.sessionId = sessionId;
    this.userId = userId;
    this.organizationLearnerId = organizationLearnerId;
    this.subscriptions = subscriptions;
    this.billingMode = billingMode;
    this.prepaymentCode = prepaymentCode;
    this.hasSeenCertificationInstructions = hasSeenCertificationInstructions;
    this.accessibilityAdjustmentNeeded = accessibilityAdjustmentNeeded;
    this.reconciledAt = reconciledAt;

    Object.defineProperty(this, 'complementaryCertification', {
      enumerable: true,
      get: function () {
        return this.#complementaryCertification;
      },

      set: function (complementaryCertification) {
        this.#complementaryCertification = complementaryCertification;
        this.subscriptions = this.subscriptions.filter((subscription) => subscription.type === SUBSCRIPTION_TYPES.CORE);
        if (complementaryCertification?.id) {
          this.subscriptions.push(
            Subscription.buildComplementary({
              certificationCandidateId: this.id,
              complementaryCertificationId: complementaryCertification.id,
            }),
          );
        }
      },
    });

    this.complementaryCertification = complementaryCertification;
  }

  static parseBillingMode({ billingMode, translate }) {
    switch (billingMode) {
      case translate('candidate-list-template.billing-mode.free'):
        return 'FREE';
      case translate('candidate-list-template.billing-mode.paid'):
        return 'PAID';
      case translate('candidate-list-template.billing-mode.prepaid'):
        return 'PREPAID';
      case null:
      default:
        return '';
    }
  }

  static translateBillingMode({ billingMode, translate }) {
    switch (billingMode) {
      case 'FREE':
        return translate('candidate-list-template.billing-mode.free');
      case 'PAID':
        return translate('candidate-list-template.billing-mode.paid');
      case 'PREPAID':
        return translate('candidate-list-template.billing-mode.prepaid');
      case null:
      default:
        return '';
    }
  }

  isAuthorizedToStart() {
    return this.authorizedToStart;
  }

  isGranted(key) {
    return this.complementaryCertification?.key === key;
  }
}

CertificationCandidate.BILLING_MODES = BILLING_MODES;

export { CertificationCandidate };
