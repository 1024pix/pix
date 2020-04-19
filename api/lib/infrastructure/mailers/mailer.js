const createSendEmailQueueService = require('../../infrastructure/queued-jobs/create-send-email-queue-service');
const MailingProvider = require('./MailingProvider');
const MailjetProvider = require('./MailjetProvider');
const SendinblueProvider = require('./SendinblueProvider');
const MockLogEmailProvider = require('./MockLogEmailProvider');
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
      case 'logger':
        this._provider = new MockLogEmailProvider();
        break;
      default:
        logger.warn('Undefined mailing provider');
    }

    this.sendEmailQueue = createSendEmailQueueService.createSendEmailQueue(`${__dirname}/send-email-job-processor.js`);
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

  async sendEmail(mailOptions) {
    if (!mailing.enabled) {
      return Promise.resolve();
    }

    try {
      await mailCheck.checkMail(mailOptions.to);
      this.sendEmailQueue.add(mailOptions, createSendEmailQueueService.sendEmailJobOptions);
    } catch (err) {
      logger.warn({ err }, `Email is not valid '${mailOptions.to}'`);
    }
  }
}

module.exports = new Mailer();

