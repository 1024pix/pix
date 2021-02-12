const settings = require('../../config');
const mailer = require('../../infrastructure/mailers/mailer');
const moment = require('moment');
const tokenService = require('./token-service');

const EMAIL_ADDRESS_NO_RESPONSE = 'ne-pas-repondre@pix.fr';
const PIX_ORGA_NAME = 'Pix Orga - Ne pas répondre';
const PIX_NAME_FR = 'PIX - Ne pas répondre';
const PIX_NAME_EN = 'PIX - Noreply';
const ACCOUNT_CREATION_EMAIL_SUBJECT_FR = 'Votre compte Pix a bien été créé';
const ACCOUNT_CREATION_EMAIL_SUBJECT_EN = 'Your Pix account has been created';
const RESET_PASSWORD_EMAIL_SUBJECT_FR = 'Demande de réinitialisation de mot de passe PIX';
const RESET_PASSWORD_EMAIL_SUBJECT_EN = 'Pix password reset request';

function sendAccountCreationEmail(email, locale, redirectionUrl) {

  let pixName;
  let accountCreationEmailSubject;
  let variables;

  if (locale === 'fr') {
    variables = {
      homeName: `pix${settings.domain.tldOrg}`,
      homeUrl: `${settings.domain.pix + settings.domain.tldOrg}/fr/`,
      redirectionUrl: redirectionUrl || `${settings.domain.pixApp + settings.domain.tldOrg}/connexion/?lang=fr`,
      locale,
    };

    pixName = PIX_NAME_FR;
    accountCreationEmailSubject = ACCOUNT_CREATION_EMAIL_SUBJECT_FR;
  }

  else if (locale === 'en') {
    variables = {
      homeName: `pix${settings.domain.tldOrg}`,
      homeUrl: `${settings.domain.pix + settings.domain.tldOrg}/en-gb/`,
      redirectionUrl: redirectionUrl || `${settings.domain.pixApp + settings.domain.tldOrg}/connexion/?lang=en`,
      locale,
    };

    pixName = PIX_NAME_EN;
    accountCreationEmailSubject = ACCOUNT_CREATION_EMAIL_SUBJECT_EN;
  }

  else {
    variables = {
      homeName: `pix${settings.domain.tldFr}`,
      homeUrl: `${settings.domain.pix + settings.domain.tldFr}`,
      redirectionUrl: redirectionUrl || `${settings.domain.pixApp + settings.domain.tldFr}/connexion`,
      locale,
    };

    pixName = PIX_NAME_FR;
    accountCreationEmailSubject = ACCOUNT_CREATION_EMAIL_SUBJECT_FR;
  }

  return mailer.sendEmail({
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: pixName,
    to: email,
    subject: accountCreationEmailSubject,
    template: mailer.accountCreationTemplateId,
    variables,
  });
}

function sendCertificationResultEmail({
  email,
  sessionId,
  sessionDate,
  certificationCenterName,
  resultRecipientEmail,
  daysBeforeExpiration,
}) {
  const pixName = PIX_NAME_FR;
  const formatedSessionDate = moment(sessionDate).locale('fr').format('L');
  const token = tokenService.createCertificationResultsByRecipientEmailLinkToken({ sessionId, resultRecipientEmail, daysBeforeExpiration });
  const link = `${settings.domain.pixApp + settings.domain.tldOrg}/api/sessions/download-results/${token}`;

  const variables = {
    link,
    sessionId,
    sessionDate: formatedSessionDate,
    certificationCenterName,
  };

  return mailer.sendEmail({
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: pixName,
    to: email,
    template: mailer.certificationResultTemplateId,
    variables,
  });
}

function sendResetPasswordDemandEmail(email, locale, temporaryKey) {
  let pixName;
  let resetPasswordEmailSubject;
  let variables;

  if (locale === 'fr') {
    variables = {
      homeName: `pix${settings.domain.tldOrg}`,
      homeUrl: `${settings.domain.pix + settings.domain.tldOrg}/fr/`,
      resetUrl: `${settings.domain.pixApp + settings.domain.tldOrg}/changer-mot-de-passe/${temporaryKey}/?lang=fr`,
      locale,
    };

    pixName = PIX_NAME_FR;
    resetPasswordEmailSubject = RESET_PASSWORD_EMAIL_SUBJECT_FR;
  }

  else if (locale === 'en') {
    variables = {
      homeName: `pix${settings.domain.tldOrg}`,
      homeUrl: `${settings.domain.pix + settings.domain.tldOrg}/en-gb/`,
      resetUrl: `${settings.domain.pixApp + settings.domain.tldOrg}/changer-mot-de-passe/${temporaryKey}/?lang=en`,
      locale,
    };

    pixName = PIX_NAME_EN;
    resetPasswordEmailSubject = RESET_PASSWORD_EMAIL_SUBJECT_EN;
  }

  else {
    variables = {
      homeName: `pix${settings.domain.tldFr}`,
      homeUrl: `${settings.domain.pix + settings.domain.tldFr}`,
      resetUrl: `${settings.domain.pixApp + settings.domain.tldFr}/changer-mot-de-passe/${temporaryKey}`,
      locale,
    };

    pixName = PIX_NAME_FR;
    resetPasswordEmailSubject = RESET_PASSWORD_EMAIL_SUBJECT_FR;
  }

  return mailer.sendEmail({
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: pixName,
    to: email,
    subject: resetPasswordEmailSubject,
    template: mailer.passwordResetTemplateId,
    variables,
  });
}

function sendOrganizationInvitationEmail({
  email,
  organizationName,
  organizationInvitationId,
  code,
  locale,
  tags,
}) {
  locale = locale ? locale : 'fr-fr';

  let variables = {
    organizationName,
    pixHomeName: `pix${settings.domain.tldFr}`,
    pixHomeUrl: `${settings.domain.pix + settings.domain.tldFr}`,
    pixOrgaHomeUrl: `${settings.domain.pixOrga + settings.domain.tldFr}`,
    redirectionUrl: `${settings.domain.pixOrga + settings.domain.tldFr}/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
    locale,
  };

  if (locale === 'fr') {
    variables = {
      organizationName,
      pixHomeName: `pix${settings.domain.tldOrg}`,
      pixHomeUrl: `${settings.domain.pix + settings.domain.tldOrg}`,
      pixOrgaHomeUrl: `${settings.domain.pixOrga + settings.domain.tldOrg}`,
      redirectionUrl: `${settings.domain.pixOrga + settings.domain.tldOrg}/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
      locale,
    };
  }

  return mailer.sendEmail({
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: PIX_ORGA_NAME,
    to: email,
    subject: 'Invitation à rejoindre Pix Orga',
    template: mailer.organizationInvitationTemplateId,
    variables,
    tags: tags || null,
  });
}

function sendScoOrganizationInvitationEmail({
  email,
  organizationName,
  firstName, lastName,
  organizationInvitationId,
  code,
  locale,
  tags,
}) {
  locale = locale ? locale : 'fr-fr';

  let variables = {
    organizationName,
    firstName, lastName,
    pixHomeName: `pix${settings.domain.tldFr}`,
    pixHomeUrl: `${settings.domain.pix + settings.domain.tldFr}`,
    pixOrgaHomeUrl: `${settings.domain.pixOrga + settings.domain.tldFr}`,
    redirectionUrl: `${settings.domain.pixOrga + settings.domain.tldFr}/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
    locale,
  };

  if (locale === 'fr') {
    variables = {
      organizationName,
      firstName, lastName,
      pixHomeName: `pix${settings.domain.tldOrg}`,
      pixHomeUrl: `${settings.domain.pix + settings.domain.tldOrg}`,
      pixOrgaHomeUrl: `${settings.domain.pixOrga + settings.domain.tldOrg}`,
      redirectionUrl: `${settings.domain.pixOrga + settings.domain.tldOrg}/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
      locale,
    };
  }

  return mailer.sendEmail({
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: PIX_ORGA_NAME,
    to: email,
    subject: 'Accès à votre espace Pix Orga',
    template: mailer.organizationInvitationScoTemplateId,
    variables,
    tags: tags || null,
  });
}

module.exports = {
  sendAccountCreationEmail,
  sendCertificationResultEmail,
  sendOrganizationInvitationEmail,
  sendScoOrganizationInvitationEmail,
  sendResetPasswordDemandEmail,
};
