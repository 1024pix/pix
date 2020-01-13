const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const mailingConfig = require('../config').mailing_sendinblue;
const mailerConfig = require('../config').mailer_service;
const API_KEY = mailingConfig.sendinblueApiKey;
const mailCheck = require('./mail-check');
const logger = require('./logger');

// Configure API key authorization: api-key
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = API_KEY;

function _formatPayload(options) {
  return {
    to: [{
      email: options.to,
    }],
    sender: {
      name: options.fromName,
      email: options.from,
    },
    subject: options.subject || '',
    templateId: 1,
    headers: {
      'content-type': 'application/json',
      'accept': 'application/json',
    },
    params: options.variables || undefined
  };
}

async function sendEmail(options) {
  if (!mailerConfig.enabled) {
    return Promise.resolve();
  }
  const apiInstance = new SibApiV3Sdk.SMTPApi();

  const payload = _formatPayload(options);
  return mailCheck.checkMail(options.to)
    .then(() => {
      apiInstance.sendTransacEmail(payload)
        .catch((err) => {
          logger.warn({ err }, `Could not send email to '${options.to}'`);
        });
    })
    .catch((err) => {
      logger.warn({ err }, `Email is not valid '${options.to}'`);
    });

}

module.exports = {
  sendEmail,
};
