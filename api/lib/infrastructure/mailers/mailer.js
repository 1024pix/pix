const MailingProvider = require('./MailingProvider');
const MailjetProvider = require('./MailjetProvider');
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
      case 'mailjet':
        this._provider = new MailjetProvider();
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

}

module.exports = new Mailer();

