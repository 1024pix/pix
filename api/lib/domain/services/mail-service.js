const settings = require('../../config');
const mailer = require('../../infrastructure/mailers/mailer');

const EMAIL_ADDRESS_NO_RESPONSE = 'ne-pas-repondre@pix.fr';
const PIX_NAME = 'PIX - Ne pas répondre';
const PIX_ORGA_NAME = 'Pix Orga - Ne pas répondre';

function sendAccountCreationEmail(email) {
  return mailer.sendEmail({
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: PIX_NAME,
    to: email,
    subject: 'Création de votre compte PIX',
    template: mailer.accountCreationTemplateId,
  });
}

function sendResetPasswordDemandEmail(email, locale, temporaryKey) {
  let variables = {
    homeName: `${settings.app.domainFr}`,
    homeUrl: `https://${settings.app.domainFr}`,
    resetUrl: `https://app.${settings.app.domainFr}/changer-mot-de-passe/${temporaryKey}`,
    locale
  };

  if (locale === 'fr') {
    variables = {
      homeName: `${settings.app.domainOrg}`,
      homeUrl: `https://${settings.app.domainOrg}`,
      resetUrl: `https://app.${settings.app.domainOrg}/changer-mot-de-passe/${temporaryKey}`,
      locale
    };
  }

  return mailer.sendEmail({
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: PIX_NAME,
    to: email,
    subject: 'Demande de réinitialisation de mot de passe PIX',
    template: mailer.passwordResetTemplateId,
    variables
  });
}

function sendOrganizationInvitationEmail({
  email,
  organizationName,
  organizationInvitationId,
  code,
  tags
}) {
  const pixOrgaBaseUrl = settings.pixOrgaUrl;
  return mailer.sendEmail({
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: PIX_ORGA_NAME,
    to: email,
    subject: 'Invitation à rejoindre Pix Orga',
    template: mailer.organizationInvitationTemplateId,
    variables: {
      organizationName,
      responseUrl: `${pixOrgaBaseUrl}/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
    },
    tags: tags || null
  });
}

module.exports = {
  sendAccountCreationEmail,
  sendOrganizationInvitationEmail,
  sendResetPasswordDemandEmail,
};
