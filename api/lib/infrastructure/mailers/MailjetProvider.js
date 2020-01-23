const _ = require('lodash');
const MailingClient = require('./MailingProvider');
const { mailing } = require('../../config');
const nodeMailjet = require('node-mailjet');

function _formatPayload(options) {

  const configuration = _.defaults(options, {
    from: 'communaute@pix.fr',
    fromName: 'Communauté PIX',
    to: null,
    subject: 'Bienvenue dans la communauté PIX',
    template: null
  });
  const variables = configuration.variables || {};
  return {
    'FromEmail': configuration.from,
    'FromName': configuration.fromName,
    'Subject': configuration.subject,
    'MJ-TemplateID': configuration.template,
    'MJ-TemplateLanguage': 'true',
    'Recipients': [{ 'Email': configuration.to, 'Vars': variables }]
  };
}

class MailjetProvider extends MailingClient {

  constructor() {
    super();

    const provider = mailing[mailing.provider];
    this._apiInstance = nodeMailjet.connect(provider.apiKey, provider.apiSecret);
  }

  _doSendEmail(options) {
    const payload = _formatPayload(options);
    return this._apiInstance.post('send').request(payload);
  }
}

module.exports = MailjetProvider;
