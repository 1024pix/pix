const _ = require('lodash');
const mailjetConfig = require('../settings').mailjet;
const nodeMailjet = require('node-mailjet');

function _formatPayload(options) {

  const configuration = _.defaults(options, {
    from: 'communaute@pix.beta.gouv.fr',
    fromName: 'Communauté PIX',
    to: null,
    subject: 'Bienvenue dans la communauté PIX',
    template: null
  });

  return {
    'FromEmail': configuration.from,
    'FromName': configuration.fromName,
    'Subject': configuration.subject,
    'MJ-TemplateID': configuration.template,
    'MJ-TemplateLanguage': 'true',
    'Recipients': [ { 'Email': configuration.to } ]
  };
}

function sendEmail(options) {
  const mailjet = nodeMailjet.connect(mailjetConfig.apiKey, mailjetConfig.apiSecret);

  return mailjet
    .post('send')
    .request(_formatPayload(options));
}

module.exports = {
  sendEmail
};

