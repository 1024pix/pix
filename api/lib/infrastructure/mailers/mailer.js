const Debug = require('debug');
const SendinblueProvider = require('./SendinblueProvider.js');
const { mailing } = require('../../config.js');
const logger = require('../logger.js');
const mailCheck = require('../mail-check.js');
const EmailingAttempt = require('../../domain/models/EmailingAttempt.js');
const { MailingProviderInvalidEmailError } = require('./MailingProviderInvalidEmailError');

const debugEmail = Debug('pix:mailer:email');

class Mailer {
  constructor() {
    this._providerName = mailing.provider;

    switch (this._providerName) {
      case 'sendinblue':
        this._provider = new SendinblueProvider();
        break;
      default:
        logger.warn('Undefined mailing provider');
    }
  }

  async sendEmail(options) {
    debugEmail(options);
    try {
      await mailCheck.checkDomainIsValid(options.to);
    } catch (err) {
      logger.warn({ err }, `Email is not valid '${options.to}'`);
      return EmailingAttempt.failure(options.to, EmailingAttempt.errorCode.INVALID_DOMAIN);
    }

    if (!mailing.enabled) {
      return EmailingAttempt.success(options.to);
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
}
const mailer = new Mailer();

module.exports = { mailer };
