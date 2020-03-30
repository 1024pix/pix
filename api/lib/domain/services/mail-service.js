const settings = require('../../config');
const mailer = require('../../infrastructure/mailers/mailer');

const EMAIL_NO_RESPONSE = 'ne-pas-repondre@pix.fr';
const PIX_NAME = 'PIX - Ne pas répondre';
const PIX_ORGA_NAME = 'Pix Orga - Ne pas répondre';

function sendAccountCreationEmail(email) {
  return mailer.sendEmail({
    template: mailer.accountCreationTemplateId,
    to: email,
    from: EMAIL_NO_RESPONSE,
    fromName: PIX_NAME,
    subject: 'Création de votre compte PIX'
  });
}

function sendResetPasswordDemandEmail(email, baseUrl, temporaryKey) {
  return mailer.sendEmail({
    template: mailer.passwordResetTemplateId,
    to: email,
    from: EMAIL_NO_RESPONSE,
    fromName: PIX_NAME,
    subject: 'Demande de réinitialisation de mot de passe PIX',
    variables: { resetUrl: `${baseUrl}/changer-mot-de-passe/${temporaryKey}` }
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
    template: mailer.organizationInvitationTemplateId,
    to: email,
    from: EMAIL_NO_RESPONSE,
    fromName: PIX_ORGA_NAME,
    subject: 'Invitation à rejoindre Pix Orga',
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
