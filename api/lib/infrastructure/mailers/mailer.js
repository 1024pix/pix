const MailingProvider = require('./MailingProvider');
const SendinblueProvider = require('./SendinblueProvider');
const { mailing } = require('../../config');
const logger = require('../logger');
const mailCheck = require('../mail-check');

class Mailer extends MailingProvider {

  constructor() {
    super();

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
    if (!mailing.enabled) {
      return Promise.resolve();
    }

    return mailCheck.checkMail(options.to)
      .then(() => {
        return this._provider.sendEmail(options)
          .catch((err) => {
            logger.warn({ err }, `Could not send email to '${options.to}'`);
          });
      })
      .catch((err) => {
        logger.warn({ err }, `Email is not valid '${options.to}'`);
      });
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

