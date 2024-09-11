import Debug from 'debug';

import { config } from '../../../config.js';
import { logger } from '../../../infrastructure/utils/logger.js';
import { EmailingAttempt } from '../../domain/models/EmailingAttempt.js';
import { MailingProviderInvalidEmailError } from '../../domain/models/MailingProviderInvalidEmailError.js';
import { BrevoProvider } from '../providers/BrevoProvider.js';
import { MailpitProvider } from '../providers/MailpitProvider.js';
import * as mailCheck from '../services/mail-check.js';

const { mailing } = config;
const debugEmail = Debug('pix:mailer:email');

class Mailer {
  constructor({ dependencies = { mailCheck } } = {}) {
    this._providerName = mailing.provider;
    this.dependencies = dependencies;
    switch (this._providerName) {
      case 'brevo':
        this._provider = new BrevoProvider();
        break;
      case 'mailpit':
        this._provider = new MailpitProvider();
        break;
      default:
        logger.warn('Undefined mailing provider');
    }
  }

  async sendEmail(options) {
    debugEmail(options);

    if (!mailing.enabled) {
      return EmailingAttempt.success(options.to);
    }

    try {
      await this.dependencies.mailCheck.checkDomainIsValid(options.to);
    } catch (err) {
      logger.warn({ err }, `Email is not valid '${options.to}'`);
      return EmailingAttempt.failure(options.to, EmailingAttempt.errorCode.INVALID_DOMAIN);
    }

    try {
      await this._provider.sendEmail(options);
    } catch (err) {
      logger.warn({ err }, `Could not send email to '${options.to}'`);

      if (err instanceof MailingProviderInvalidEmailError) {
        return EmailingAttempt.failure(options.to, EmailingAttempt.errorCode.INVALID_EMAIL, err.message);
      }

      return EmailingAttempt.failure(options.to);
    }

    return EmailingAttempt.success(options.to);
  }

  get accountCreationTemplateId() {
    return mailing[this._providerName].templates.accountCreationTemplateId;
  }

  get passwordResetTemplateId() {
    return mailing[this._providerName].templates.passwordResetTemplateId;
  }

  get organizationInvitationTemplateId() {
    return mailing[this._providerName].templates.organizationInvitationTemplateId;
  }

  get organizationInvitationScoTemplateId() {
    return mailing[this._providerName].templates.organizationInvitationScoTemplateId;
  }

  get certificationCenterInvitationTemplateId() {
    return mailing[this._providerName].templates.certificationCenterInvitationTemplateId;
  }

  get certificationResultTemplateId() {
    return mailing[this._providerName].templates.certificationResultTemplateId;
  }

  get emailChangeTemplateId() {
    return mailing[this._providerName].templates.emailChangeTemplateId;
  }

  get accountRecoveryTemplateId() {
    return mailing[this._providerName].templates.accountRecoveryTemplateId;
  }

  get emailVerificationCodeTemplateId() {
    return mailing[this._providerName].templates.emailVerificationCodeTemplateId;
  }

  get cpfEmailTemplateId() {
    return mailing[this._providerName].templates.cpfEmailTemplateId;
  }

  get acquiredCleaResultTemplateId() {
    return mailing[this._providerName].templates.acquiredCleaResultTemplateId;
  }

  get targetProfileNotCertifiableTemplateId() {
    return mailing[this._providerName].templates.targetProfileNotCertifiableTemplateId;
  }
}

const mailer = new Mailer();

export { Mailer, mailer };
