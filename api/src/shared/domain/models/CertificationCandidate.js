import JoiDate from '@joi/date';
import BaseJoi from 'joi';
import lodash from 'lodash';

import { Subscription } from '../../../certification/enrolment/domain/models/Subscription.js';
import { SubscriptionTypes } from '../../../certification/shared/domain/models/SubscriptionTypes.js';
import { validate } from '../../../certification/shared/domain/validators/certification-candidate-validator.js';
import { subscriptionSchema } from '../../../certification/shared/domain/validators/subscription-validator.js';
import {
  CertificationCandidatePersonalInfoFieldMissingError,
  CertificationCandidatePersonalInfoWrongFormat,
  CertificationCandidatesError,
} from '../errors.js';

const Joi = BaseJoi.extend(JoiDate);
const { isNil, endsWith } = lodash;

const BILLING_MODES = {
  FREE: 'FREE',
  PAID: 'PAID',
  PREPAID: 'PREPAID',
};

const certificationCandidateParticipationJoiSchema = Joi.object({
  id: Joi.any().allow(null).optional(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  sex: Joi.string().allow(null).optional(),
  birthCity: Joi.any().allow(null).optional(),
  birthProvinceCode: Joi.any().allow(null).optional(),
  birthCountry: Joi.any().allow(null).optional(),
  birthPostalCode: Joi.string().allow(null).optional(),
  birthINSEECode: Joi.string().allow(null).optional(),
  email: Joi.any().allow(null).optional(),
  resultRecipientEmail: Joi.string().email().allow(null).optional(),
  externalId: Joi.any().allow(null).optional(),
  birthdate: Joi.date().format('YYYY-MM-DD').greater('1900-01-01').required(),
  createdAt: Joi.any().allow(null).optional(),
  authorizedToStart: Joi.boolean().optional(),
  extraTimePercentage: Joi.any().allow(null).optional(),
  sessionId: Joi.number().required(),
  userId: Joi.any().allow(null).optional(),
  organizationLearnerId: Joi.any().allow(null).optional(),
  complementaryCertification: Joi.object({
    id: Joi.number().required(),
    label: Joi.string().required().empty(null),
    key: Joi.string().required().empty(null),
  }).allow(null),
  billingMode: Joi.string()
    .valid(...Object.values(BILLING_MODES))
    .empty(null),
  prepaymentCode: Joi.string().allow(null).optional(),
  subscriptions: Joi.array().items(subscriptionSchema).unique('type').required(),
  hasSeenCertificationInstructions: Joi.boolean().optional(),
});

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

    Object.defineProperty(this, 'complementaryCertification', {
      enumerable: true,
      get: function () {
        return this.#complementaryCertification;
      },

      set: function (complementaryCertification) {
        this.#complementaryCertification = complementaryCertification;
        this.subscriptions = this.subscriptions.filter((subscription) => subscription.type === SubscriptionTypes.CORE);
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

  validate(isSco = false) {
    const { error } = validate(
      { ...this, complementaryCertification: this.complementaryCertification },
      {
        allowUnknown: true,
        context: {
          isSco,
          isSessionsMassImport: false,
        },
      },
    );

    if (error) {
      throw new CertificationCandidatesError({
        code: error.details?.[0]?.message,
        meta: error.details?.[0]?.context?.value,
      });
    }
  }

  validateForMassSessionImport(isSco = false) {
    const { error } = validate(
      { ...this, complementaryCertification: this.complementaryCertification },
      {
        abortEarly: false,
        allowUnknown: true,
        context: {
          isSco,
          isSessionsMassImport: true,
        },
      },
    );
    if (error) {
      return error.details.map(({ message }) => message);
    }
  }

  validateParticipation() {
    const { error } = certificationCandidateParticipationJoiSchema.validate({
      ...this,
      complementaryCertification: this.complementaryCertification,
    });
    if (error) {
      if (endsWith(error.details[0].type, 'required')) {
        throw new CertificationCandidatePersonalInfoFieldMissingError();
      }
      throw new CertificationCandidatePersonalInfoWrongFormat();
    }

    if (this.isBillingModePrepaid() && !this.prepaymentCode) {
      throw new CertificationCandidatePersonalInfoFieldMissingError();
    }
  }

  isAuthorizedToStart() {
    return this.authorizedToStart;
  }

  isLinkedToAUser() {
    return !isNil(this.userId);
  }

  isLinkedToUserId(userId) {
    return this.userId === userId;
  }

  updateBirthInformation({ birthCountry, birthINSEECode, birthPostalCode, birthCity }) {
    this.birthCountry = birthCountry;
    this.birthINSEECode = birthINSEECode;
    this.birthPostalCode = birthPostalCode;
    this.birthCity = birthCity;
  }

  isGranted(key) {
    return this.complementaryCertification?.key === key;
  }

  isBillingModePrepaid() {
    return this.billingMode === CertificationCandidate.BILLING_MODES.PREPAID;
  }

  convertExtraTimePercentageToDecimal() {
    this.extraTimePercentage = this.extraTimePercentage / 100;
  }

  /**
   * @param {Subscription} subscription
   */
  addSubscription(subscription) {
    this.subscriptions = this.subscriptions.filter(({ type }) => subscription.type !== type);
    this.subscriptions.push(subscription);
  }
}

CertificationCandidate.BILLING_MODES = BILLING_MODES;

export { CertificationCandidate };
