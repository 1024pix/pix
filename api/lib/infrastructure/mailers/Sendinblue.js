const SibApiV3Sdk = require('sib-api-v3-sdk');
const Mailer = require('./Mailer');
const { mailing } = require('../../config');
const mailCheck = require('../mail-check');
const logger = require('../logger');

function _formatPayload(options) {
  const payload = {
    to: [{
      email: options.to,
    }],
    sender: {
      name: options.fromName,
      email: options.from,
    },
    subject: options.subject || '',
    templateId: parseInt(options.template),
    headers: {
      'content-type': 'application/json',
      'accept': 'application/json',
    },
  };
  if (options.variables) {
    payload.params = options.variables;
  }
  return payload;
}

class Sendinblue extends Mailer {

  constructor() {
    super();

    const provider = mailing.provider;
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    defaultClient.authentications['api-key'].apiKey = mailing[provider].apiKey;

    this._apiInstance = Sendinblue.createSendinblueSMTPApi();
  }

  static createSendinblueSMTPApi() {
    return new SibApiV3Sdk.SMTPApi();
  }

  _doSendEmail(options) {
    const payload = _formatPayload(options);
    return this._apiInstance.sendTransacEmail(payload);
  }

  sendEmail(options) {
    if (!mailing.enabled) {
      return Promise.resolve();
    }

    return mailCheck.checkMail(options.to)
      .then(() => {
        return this._doSendEmail(options)
          .catch((err) => {
            logger.warn({ err }, `Could not send email to '${options.to}'`);
          });
      })
      .catch((err) => {
        logger.warn({ err }, `Email is not valid '${options.to}'`);
      });
  }
}

module.exports = Sendinblue;
