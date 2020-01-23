const settings = require('../../config');
const mailer = require('../../infrastructure/mailers/mailer');

function sendAccountCreationEmail(email) {
  return mailer.sendEmail({
    template: mailer.accountCreationTemplateId,
    to: email,
    from: 'ne-pas-repondre@pix.fr',
    fromName: 'PIX - Ne pas répondre',
    subject: 'Création de votre compte PIX'
  });
}

function sendResetPasswordDemandEmail(email, baseUrl, temporaryKey) {
  return mailer.sendEmail({
    template: mailer.passwordResetTemplateId,
    to: email,
    from: 'ne-pas-repondre@pix.fr',
    fromName: 'PIX - Ne pas répondre',
    subject: 'Demande de réinitialisation de mot de passe PIX',
    variables: { resetUrl: `${baseUrl}/changer-mot-de-passe/${temporaryKey}` }
  });
}

function sendOrganizationInvitationEmail({
  email,
  organizationName,
  organizationInvitationId,
  code
}) {
  const pixOrgaBaseUrl = settings.pixOrgaUrl;
  return mailer.sendEmail({
    template: mailer.organizationInvitationTemplateId,
    to: email,
    from: 'ne-pas-repondre@pix.fr',
    fromName: 'Pix Orga - Ne pas répondre',
    subject: 'Invitation à rejoindre Pix Orga',
    variables: {
      organizationName,
      responseUrl: `${pixOrgaBaseUrl}/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
    }
  });
}

module.exports = {
  sendAccountCreationEmail,
  sendOrganizationInvitationEmail,
  sendResetPasswordDemandEmail,
};
