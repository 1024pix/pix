const _ = require('lodash');
const SibApiV3Sdk = require('sib-api-v3-sdk');

const MailingProvider = require('./MailingProvider.js');
const { mailing } = require('../../config.js');

function _formatPayload({ to, fromName, from, subject, template, variables, tags }) {
  const payload = {
    to: [
      {
        email: to,
      },
    ],
    sender: {
      name: fromName,
      email: from,
    },
    subject,
    templateId: parseInt(template),
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
    },
  };

  if (variables) {
    payload.params = variables;
  }

  if (_.isArray(tags) && !_.isEmpty(tags)) {
    payload.tags = tags;
  }

  return payload;
}

class SendinblueProvider extends MailingProvider {
  constructor() {
    super();

    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    defaultClient.authentications['api-key'].apiKey = mailing.sendinblue.apiKey;

    this._client = SendinblueProvider.createSendinblueSMTPApi();
  }

  static createSendinblueSMTPApi() {
    return new SibApiV3Sdk.TransactionalEmailsApi();
  }

  sendEmail(options) {
    const payload = _formatPayload(options);
    return this._client.sendTransacEmail(payload);
  }
}

module.exports = SendinblueProvider;
