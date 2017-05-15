const mailJet = require('../../infrastructure/mailjet');

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

module.exports = {
  sendAccountCreationEmail,
  sendWelcomeEmail
};
