const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const mailingConfig = require('../config').mailing_sendinblue;
const API_KEY = mailingConfig.sendinblueApiKey;

// Configure API key authorization: api-key
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = API_KEY;

// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//apiKey.apiKeyPrefix['api-key'] = "Token"
function getAccount() {
  const api = new SibApiV3Sdk.AccountApi();
  api.getAccount().then((data) => {
    console.log('API called successfully. Returned data: ' + data);
  }, function(error) {
    console.error(error);
  });

}

function sendEmail() {
  const apiInstance = new SibApiV3Sdk.SMTPApi();
  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail = {
    to: [{
      email: 'david.riviere@pix.fr',
      name: 'David Riv'
    }],
    templateId: 1,
    headers: {
      'content-type': 'application/json',
      'accept': 'application/json',
    }
  };

  apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
    console.log('API called successfully. Returned data: ' + data);
  }, function(error) {
    console.error(error);
  });
}

module.exports = {
  getAccount,
  sendEmail,
};
