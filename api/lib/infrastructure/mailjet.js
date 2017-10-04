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

function sendEmail(options) {
  const mailjet = nodeMailjet.connect(mailjetConfig.apiKey, mailjetConfig.apiSecret);

  return mailjet
    .post('send')
    .request(_formatPayload(options));
}

function getContactListByName(Name) {
  const mailJet = nodeMailjet.connect(mailjetConfig.apiKey, mailjetConfig.apiSecret);

  return mailJet
    .get('contactslist')
    .request({ Name })
    .then((contactLists) => {
      return Promise.resolve(contactLists.body.Data[0]);
    });
}

function addEmailToContactList(email, contactListID) {
  const mailJet = nodeMailjet.connect(mailjetConfig.apiKey, mailjetConfig.apiSecret);

  return mailJet
    .post('contactslist')
    .id(contactListID)
    .action('managecontact')
    .request({ Email: email, action: 'addnoforce' });
}

module.exports = {
  sendEmail,
  getContactListByName,
  addEmailToContactList
};
