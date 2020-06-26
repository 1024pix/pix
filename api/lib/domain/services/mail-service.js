const settings = require('../../config');
const mailer = require('../../infrastructure/mailers/mailer');

const EMAIL_ADDRESS_NO_RESPONSE = 'ne-pas-repondre@pix.fr';
const PIX_NAME = 'PIX - Ne pas répondre';
const PIX_ORGA_NAME = 'Pix Orga - Ne pas répondre';

function sendAccountCreationEmail(email, locale, redirectionUrl) {
  let variables = {
    homeName: `pix${settings.domain.tldFr}`,
    homeUrl: `${settings.domain.pix + settings.domain.tldFr}`,
    redirectionUrl: redirectionUrl || `${settings.domain.pixApp + settings.domain.tldFr}/connexion`,
    locale
  };
  if (locale === 'fr') {
    variables = {
      homeName: `pix${settings.domain.tldOrg}`,
      homeUrl: `${settings.domain.pix + settings.domain.tldOrg}`,
      redirectionUrl: redirectionUrl || `${settings.domain.pixApp + settings.domain.tldOrg}/connexion`,
      locale
    };
  }

  return mailer.sendEmail({
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: PIX_NAME,
    to: email,
    subject: 'Création de votre compte PIX',
    template: mailer.accountCreationTemplateId,
    variables
  });
}

function sendResetPasswordDemandEmail(email, locale, temporaryKey) {
  let variables = {
    homeName: `pix${settings.domain.tldFr}`,
    homeUrl: `${settings.domain.pix + settings.domain.tldFr}`,
    resetUrl: `${settings.domain.pixApp + settings.domain.tldFr}/changer-mot-de-passe/${temporaryKey}`,
    locale
  };

  if (locale === 'fr') {
    variables = {
      homeName: `pix${settings.domain.tldOrg}`,
      homeUrl: `${settings.domain.pix + settings.domain.tldOrg}`,
      resetUrl: `${settings.domain.pixApp + settings.domain.tldOrg}/changer-mot-de-passe/${temporaryKey}`,
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
  locale,
  tags
}) {
  locale = locale ? locale : 'fr-fr';

  let variables = {
    organizationName,
    pixHomeName: `pix${settings.domain.tldFr}`,
    pixHomeUrl: `${settings.domain.pix + settings.domain.tldFr}`,
    pixOrgaHomeUrl: `${settings.domain.pixOrga + settings.domain.tldFr}`,
    redirectionUrl: `${settings.domain.pixOrga + settings.domain.tldFr}/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
    locale
  };
  if (locale === 'fr') {
    variables = {
      organizationName,
      pixHomeName: `pix${settings.domain.tldOrg}`,
      pixHomeUrl: `${settings.domain.pix + settings.domain.tldOrg}`,
      pixOrgaHomeUrl: `${settings.domain.pixOrga + settings.domain.tldOrg}`,
      redirectionUrl: `${settings.domain.pixOrga + settings.domain.tldOrg}/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
      locale
    };
  }

  return mailer.sendEmail({
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: PIX_ORGA_NAME,
    to: email,
    subject: 'Invitation à rejoindre Pix Orga',
    template: mailer.organizationInvitationTemplateId,
    variables,
    tags: tags || null
  });
}

module.exports = {
  sendAccountCreationEmail,
  sendOrganizationInvitationEmail,
  sendResetPasswordDemandEmail,
};
