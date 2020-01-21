const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const { mailing } = require('../config');
const provider = mailing.provider;
const API_KEY = mailing[provider].apiKey;
const mailCheck = require('./mail-check');
const logger = require('./logger');

// Configure API key authorization: api-key
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = API_KEY;

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

function createSendinblueSMTPApi() {
  return new SibApiV3Sdk.SMTPApi();
}

async function sendEmail(options) {
  if (!mailing.enabled) {
    return Promise.resolve();
  }
  const apiInstance = this.createSendinblueSMTPApi();

  const payload = _formatPayload(options);
  return mailCheck.checkMail(options.to)
    .then(() => {
      return apiInstance.sendTransacEmail(payload)
        .catch((err) => {
          logger.warn({ err }, `Could not send email to '${options.to}'`);
        });
    })
    .catch((err) => {
      logger.warn({ err }, `Email is not valid '${options.to}'`);
    });

}

module.exports = {
  createSendinblueSMTPApi,
  sendEmail,
};
