const mailJet = require('../../infrastructure/mailjet');
const settings = require('../../config');

function sendAccountCreationEmail(email) {
  return mailJet.sendEmail({
    to: email,
    template: settings.mailing.mailjetAccountCreationTemplateId,
    from: 'ne-pas-repondre@pix.fr',
    fromName: 'PIX - Ne pas répondre',
    subject: 'Création de votre compte PIX'
  });
}

function sendResetPasswordDemandEmail(email, baseUrl, temporaryKey) {
  return mailJet.sendEmail({
    to: email,
    template: settings.mailing.mailjetPasswordResetTemplateId,
    from: 'ne-pas-repondre@pix.fr',
    fromName: 'PIX - Ne pas répondre',
    subject: 'Demande de réinitialisation de mot de passe PIX',
    variables: { resetUrl: `${baseUrl}/changer-mot-de-passe/${temporaryKey}` }
  });
}

function sendOrganizationInvitationEmail(
  email, organizationName, organizationInvitationId, temporaryKey
) {
  const pixOrgaBaseUrl = settings.pixOrgaUrl;

  return mailJet.sendEmail({
    to: email,
    template: settings.mailing.mailjetOrganizationInvitationTemplateId,
    from: 'ne-pas-repondre@pix.fr',
    fromName: 'PIX-ORGA - Ne pas répondre',
    subject: 'Invitation à rejoindre Pix Orga',
    variables: {
      organizationName,
      responseUrl: `${pixOrgaBaseUrl}/invitations/${organizationInvitationId}?temporaryKey=${temporaryKey}`,
    }
  });
}

module.exports = {
  sendAccountCreationEmail,
  sendOrganizationInvitationEmail,
  sendResetPasswordDemandEmail,
};
