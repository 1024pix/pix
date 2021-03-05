const MailingProvider = require('./MailingProvider');
const SendinblueProvider = require('./SendinblueProvider');
const { mailing } = require('../../config');
const logger = require('../logger');
const mailCheck = require('../mail-check');

class Mailer extends MailingProvider {

  constructor() {
    super();

    this._providerName = mailing.provider;
    this.ERROR_INVALID_EMAIL = Symbol('Error: invalid email');
    this.ERROR_EMAIL_FAILED = Symbol('Error: email failed');
    this.EMAIL_SKIPPED = Symbol('Email skipped');
    this.EMAIL_SENT = Symbol('Email sent');

    switch (this._providerName) {
      case 'sendinblue':
        this._provider = new SendinblueProvider();
        break;
      default:
        logger.warn('Undefined mailing provider');
    }
  }

  async sendEmail(options) {
    if (!mailing.enabled) {
      return this.EMAIL_SKIPPED;
    }

    try {
      await mailCheck.checkMail(options.to);
    }
    catch (err) {
      logger.warn({ err }, `Email is not valid '${options.to}'`);
      return this.ERROR_INVALID_EMAIL;
    }

    try {
      await this._provider.sendEmail(options);
    }
    catch (err) {
      logger.warn({ err }, `Could not send email to '${options.to}'`);
      return this.ERROR_EMAIL_FAILED;
    }

    return this.EMAIL_SENT;
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

  get certificationResultTemplateId() {
    return mailing[this._providerName].templates.certificationResultTemplateId;
  }

}

module.exports = new Mailer();
