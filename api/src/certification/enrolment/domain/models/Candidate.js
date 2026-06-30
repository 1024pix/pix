/**
 * @typedef {import ('./Subscription.js').Subscription} Subscription
 */
import { CertificationCandidatesError } from '../../../../shared/domain/errors.js';
import { BILLING_MODES, SUBSCRIPTION_TYPES } from '../../../shared/domain/constants.js';
import { Frameworks } from '../../../shared/domain/models/Frameworks.js';
import { validate } from '../validators/candidate-validator.js';

export class Candidate {
  /**
   * @param {object} params
   * @param {Array<Subscription>} [params.subscriptions=[]]
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
    reconciledAt,
    organizationLearnerId,
    billingMode,
    prepaymentCode,
    hasSeenCertificationInstructions = false,
    subscription,
    subscriptions = [],
    accessibilityAdjustmentNeeded,
    hasStartedTest = false,
    doubleCertificationEligibility = false,
  }) {
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
    this.extraTimePercentage = extraTimePercentage != null ? parseFloat(extraTimePercentage) : null;
    this.createdAt = createdAt;
    this.authorizedToStart = authorizedToStart;
    this.sessionId = sessionId;
    this.userId = userId;
    this.organizationLearnerId = organizationLearnerId;
    this.billingMode = billingMode;
    this.prepaymentCode = prepaymentCode;
    this.hasSeenCertificationInstructions = hasSeenCertificationInstructions;
    this.subscription = subscription;
    this.subscriptions = subscriptions;
    this.accessibilityAdjustmentNeeded = accessibilityAdjustmentNeeded;
    this.reconciledAt = reconciledAt;
    this.hasStartedTest = hasStartedTest;
    this.doubleCertificationEligibility = doubleCertificationEligibility;
    this.isLinked = Boolean(userId);
  }

  static create(candidateDTO) {
    const complementaryKey = candidateDTO.subscriptions.find((sub) => {
      return sub.type === SUBSCRIPTION_TYPES.COMPLEMENTARY;
    })?.complementaryCertificationKey;
    const mainSubscription = complementaryKey || Frameworks.CORE;

    return new Candidate({
      ...candidateDTO,
      subscription: mainSubscription,
    });
  }

  static sortByLastNameAndFirstName(candidateA, candidateB) {
    let compareRes = candidateA.lastName.localeCompare(candidateB.lastName);
    if (compareRes === 0) compareRes = candidateA.firstName.localeCompare(candidateB.firstName);
    return compareRes;
  }

  isReconciled() {
    return !!this.userId && !!this.reconciledAt;
  }

  isReconciledTo(userId) {
    return this.isReconciled() && this.userId === userId;
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

  validate({ isSco = false } = {}) {
    const { error } = validate(this, {
      allowUnknown: true,
      context: {
        isSco,
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

  convertExtraTimePercentageToDecimal() {
    this.extraTimePercentage = this.extraTimePercentage / 100;
  }

  hasCoreFrameworkSubscription() {
    return this.subscription === Frameworks.CORE;
  }

  hasCoreScopeSubscription() {
    return this.subscription === Frameworks.CORE || this.subscription === Frameworks.CLEA;
  }

  getComplementarySubscription() {
    return this.subscriptions.find((subscription) => subscription.type === SUBSCRIPTION_TYPES.COMPLEMENTARY);
  }

  get complementaryCertificationKey() {
    const complementarySubscription = this.getComplementarySubscription();
    return complementarySubscription?.complementaryCertificationKey || null;
  }

  isRegisteredToDoubleCertification() {
    return this.subscription === Frameworks.CLEA;
  }
}
