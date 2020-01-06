const mailJet = require('../../infrastructure/mailjet');
const sendinBlue = require('../../infrastructure/sendinblue');
const settings = require('../../config');

function sendAccountCreationEmail(email) {
  return eval(settings.mailer_service.provider).sendEmail({
    to: email,
    template: settings.mailing_mailjet.mailjetAccountCreationTemplateId,
    from: 'ne-pas-repondre@pix.fr',
    fromName: 'PIX - Ne pas répondre',
    subject: 'Création de votre compte PIX'
  });
}

function sendResetPasswordDemandEmail(email, baseUrl, temporaryKey) {
  return mailJet.sendEmail({
    to: email,
    template: settings.mailing_mailjet.mailjetPasswordResetTemplateId,
    from: 'ne-pas-repondre@pix.fr',
    fromName: 'PIX - Ne pas répondre',
    subject: 'Demande de réinitialisation de mot de passe PIX',
    variables: { resetUrl: `${baseUrl}/changer-mot-de-passe/${temporaryKey}` }
  });
}

function sendOrganizationInvitationEmail({
  email, organizationName, organizationInvitationId, code
}) {
  const pixOrgaBaseUrl = settings.pixOrgaUrl;

  return mailJet.sendEmail({
    to: email,
    template: settings.mailing_mailjet.mailjetOrganizationInvitationTemplateId,
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
