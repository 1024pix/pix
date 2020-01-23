const _ = require('lodash');
const nodeMailjet = require('node-mailjet');
const MailingProvider = require('./MailingProvider');
const { mailing } = require('../../config');

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

class MailjetProvider extends MailingProvider {

  constructor() {
    super();
    this._client = nodeMailjet.connect(mailing.mailjet.apiKey, mailing.mailjet.apiSecret);
  }

  sendEmail(options) {
    const payload = _formatPayload(options);
    return this._client.post('send').request(payload);
  }
}

module.exports = MailjetProvider;
