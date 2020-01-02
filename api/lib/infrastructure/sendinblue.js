const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const mailingConfig = require('../config').mailing_sendinblue;
const API_KEY = mailingConfig.sendinblueApiKey;
const mailCheck = require('./mail-check');

// Configure API key authorization: api-key
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = API_KEY;

function _formatPayload(options) {
  return {
    to: 'david.riviere@pix.fr', //TODO change in options.email
    templateId: 1,
    headers: {
      'content-type': 'application/json',
      'accept': 'application/json',
    }
  };
}

async function sendEmail(options) {
  if (!mailingConfig) {
    return Promise.resolve();
  }
  const apiInstance = new SibApiV3Sdk.SMTPApi();

  const payload = _formatPayload(options);
  await mailCheck.checkMail(options.to);

  apiInstance.sendTransacEmail(payload).then(function(data) {
    console.log('API called successfully. Returned data: ' + data);
  }, function(error) {
    console.error(error);
  });
}

module.exports = {
  sendEmail,
};
