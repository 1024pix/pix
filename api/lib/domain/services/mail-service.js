const _ = require('lodash');
const mailJet = require('../../infrastructure/mailjet');
const logger = require('./../../infrastructure/logger');
const ACCOUNT_CREATION_EMAIL_TEMPLATE_ID = '143620';
const WELCOME_EMAIL_TEMPLATE_ID = '129291';

function sendAccountCreationEmail(email) {
  return mailJet.sendEmail({
    to: email,
    template: ACCOUNT_CREATION_EMAIL_TEMPLATE_ID,
    from: 'ne-pas-repondre@pix.beta.gouv.fr',
    fromName: 'PIX - Ne pas répondre',
    subject: 'Création de votre compte PIX'
  });
}

function sendWelcomeEmail(email) {
  return mailJet.sendEmail({
    to: email,
    template: WELCOME_EMAIL_TEMPLATE_ID
  });
}

function addEmailToRandomContactList(email) {
  const contactListToPopulate = _.sample(['WEBPIX', 'TESTPIX', 'BETAPIX']);

  return mailJet
    .getContactListByName(contactListToPopulate)
    .then((contactList) => {
      return mailJet.addEmailToContactList(email, contactList.ID);
    })
    .catch((err) => {
      logger.error(err);
    });
}

module.exports = {
  addEmailToRandomContactList,
  sendAccountCreationEmail,
  sendWelcomeEmail
};
