const _ = require('lodash');
const mailJet = require('../../infrastructure/mailjet');
const logger = require('./../../infrastructure/logger');
const ACCOUNT_CREATION_EMAIL_TEMPLATE_ID = '143620';
const WELCOME_EMAIL_TEMPLATE_ID = '129291';
const RESET_PASSWORD_DEMAND_EMAIL_TEMPLATE_ID = '207534';

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

function sendResetPasswordDemandEmail(email, baseUrl, temporaryKey) {
  return mailJet.sendEmail({
    to: email,
    template: RESET_PASSWORD_DEMAND_EMAIL_TEMPLATE_ID,
    from: 'ne-pas-repondre@pix.beta.gouv.fr',
    fromName: 'PIX - Ne pas répondre',
    subject: 'Demande de réinitialisation de mot de passe PIX',
    variables: { resetUrl: `${baseUrl}/compte/motdepasse/${temporaryKey}` }
  });
}

module.exports = {
  addEmailToRandomContactList,
  sendAccountCreationEmail,
  sendWelcomeEmail,
  sendResetPasswordDemandEmail
};
