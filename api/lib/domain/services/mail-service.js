const moment = require('moment');

const tokenService = require('./token-service');
const mailer = require('../../infrastructure/mailers/mailer');
const settings = require('../../config');

const frTranslations = require('../../../translations/fr');
const enTranslations = require('../../../translations/en');

const {
  ENGLISH_SPOKEN,
  FRENCH_FRANCE,
  FRENCH_SPOKEN,
} = require('../../domain/constants').LOCALE;

const EMAIL_ADDRESS_NO_RESPONSE = 'ne-pas-repondre@pix.fr';
const PIX_ORGA_NAME_FR = 'Pix Orga - Ne pas répondre';
const PIX_ORGA_NAME_EN = 'Pix Orga - Noreply';
const PIX_NAME_FR = 'PIX - Ne pas répondre';
const PIX_NAME_EN = 'PIX - Noreply';
const ACCOUNT_CREATION_EMAIL_SUBJECT_FR = 'Votre compte Pix a bien été créé';
const ACCOUNT_CREATION_EMAIL_SUBJECT_EN = 'Your Pix account has been created';
const HELPDESK_FR = 'https://support.pix.fr/support/tickets/new';
const HELPDESK_EN = 'https://pix.org/en-gb/help-form';
const ORGANIZATION_INVITATION_EMAIL_SUBJECT_FR = 'Invitation à rejoindre Pix Orga';
const ORGANIZATION_INVITATION_EMAIL_SUBJECT_EN = 'Invitation to join Pix Orga';

const EMAIL_CHANGE_TAG = 'EMAIL_CHANGE';

function sendAccountCreationEmail(email, locale, redirectionUrl) {

  let pixName;
  let accountCreationEmailSubject;
  let variables;

  if (locale === FRENCH_SPOKEN) {
    variables = {
      homeName: `pix${settings.domain.tldOrg}`,
      homeUrl: `${settings.domain.pix + settings.domain.tldOrg}/fr/`,
      redirectionUrl: redirectionUrl || `${settings.domain.pixApp + settings.domain.tldOrg}/connexion/?lang=fr`,
      helpdeskUrl: HELPDESK_FR,
      displayNationalLogo: false,
      ...frTranslations['pix-account-creation-email'].params,
    };

    pixName = PIX_NAME_FR;
    accountCreationEmailSubject = ACCOUNT_CREATION_EMAIL_SUBJECT_FR;
  }

  else if (locale === ENGLISH_SPOKEN) {
    variables = {
      homeName: `pix${settings.domain.tldOrg}`,
      homeUrl: `${settings.domain.pix + settings.domain.tldOrg}/en-gb/`,
      redirectionUrl: redirectionUrl || `${settings.domain.pixApp + settings.domain.tldOrg}/connexion/?lang=en`,
      helpdeskUrl: HELPDESK_EN,
      displayNationalLogo: false,
      ...enTranslations['pix-account-creation-email'].params,
    };

    pixName = PIX_NAME_EN;
    accountCreationEmailSubject = ACCOUNT_CREATION_EMAIL_SUBJECT_EN;
  }

  else {
    variables = {
      homeName: `pix${settings.domain.tldFr}`,
      homeUrl: `${settings.domain.pix + settings.domain.tldFr}`,
      redirectionUrl: redirectionUrl || `${settings.domain.pixApp + settings.domain.tldFr}/connexion`,
      helpdeskUrl: HELPDESK_FR,
      displayNationalLogo: true,
      ...frTranslations['pix-account-creation-email'].params,
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
  const formattedSessionDate = moment(sessionDate).locale('fr').format('L');
  const token = tokenService.createCertificationResultsByRecipientEmailLinkToken({ sessionId, resultRecipientEmail, daysBeforeExpiration });
  const link = `${settings.domain.pixApp + settings.domain.tldOrg}/api/sessions/download-results/${token}`;

  const variables = {
    link,
    sessionId,
    sessionDate: formattedSessionDate,
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

function sendResetPasswordDemandEmail({
  email,
  locale,
  temporaryKey,
}) {
  const localeParam = locale ? locale : FRENCH_FRANCE;

  let pixName = PIX_NAME_FR;
  let resetPasswordEmailSubject = frTranslations['reset-password-demand-email'].subject;

  let templateParams = {
    locale: localeParam,
    ...frTranslations['reset-password-demand-email'].params,
    homeName: `pix${settings.domain.tldFr}`,
    homeUrl: `${settings.domain.pix + settings.domain.tldFr}`,
    resetUrl: `${settings.domain.pixApp + settings.domain.tldFr}/changer-mot-de-passe/${temporaryKey}`,
    helpdeskURL: HELPDESK_FR,
  };

  if (localeParam === FRENCH_SPOKEN) {
    templateParams = {
      ...templateParams,
      homeName: `pix${settings.domain.tldOrg}`,
      homeUrl: `${settings.domain.pix + settings.domain.tldOrg}/fr/`,
      resetUrl: `${settings.domain.pixApp + settings.domain.tldOrg}/changer-mot-de-passe/${temporaryKey}/?lang=fr`,
      helpdeskURL: frTranslations['reset-password-demand-email'].params.helpdeskURL,
    };
  }

  if (localeParam === ENGLISH_SPOKEN) {
    templateParams = {
      locale: localeParam,
      ...enTranslations['reset-password-demand-email'].params,
      homeName: `pix${settings.domain.tldOrg}`,
      homeUrl: `${settings.domain.pix + settings.domain.tldOrg}/en-gb/`,
      resetUrl: `${settings.domain.pixApp + settings.domain.tldOrg}/changer-mot-de-passe/${temporaryKey}/?lang=en`,
    };

    pixName = PIX_NAME_EN;
    resetPasswordEmailSubject = enTranslations['reset-password-demand-email'].subject;
  }

  return mailer.sendEmail({
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: pixName,
    to: email,
    subject: resetPasswordEmailSubject,
    template: mailer.passwordResetTemplateId,
    variables: templateParams,
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
  locale = locale ? locale : FRENCH_FRANCE;
  let pixOrgaName = PIX_ORGA_NAME_FR;
  let sendOrganizationInvitationEmailSubject = ORGANIZATION_INVITATION_EMAIL_SUBJECT_FR;

  let templateParams = {
    organizationName,
    pixHomeName: `pix${settings.domain.tldFr}`,
    pixHomeUrl: `${settings.domain.pix + settings.domain.tldFr}`,
    pixOrgaHomeUrl: `${settings.domain.pixOrga + settings.domain.tldFr}`,
    redirectionUrl: `${settings.domain.pixOrga + settings.domain.tldFr}/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
    supportUrl: HELPDESK_FR,
    ...frTranslations['organization-invitation-email'],
  };

  if (locale === FRENCH_SPOKEN) {
    templateParams = {
      organizationName,
      pixHomeName: `pix${settings.domain.tldOrg}`,
      pixHomeUrl: `${settings.domain.pix + settings.domain.tldOrg}`,
      pixOrgaHomeUrl: `${settings.domain.pixOrga + settings.domain.tldOrg}`,
      redirectionUrl: `${settings.domain.pixOrga + settings.domain.tldOrg}/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
      supportUrl: HELPDESK_FR,
      ...frTranslations['organization-invitation-email'],
    };
  }

  if (locale === ENGLISH_SPOKEN) {
    templateParams = {
      organizationName,
      pixHomeName: `pix${settings.domain.tldOrg}`,
      pixHomeUrl: `${settings.domain.pix + settings.domain.tldOrg}/en-gb/`,
      pixOrgaHomeUrl: `${settings.domain.pixOrga + settings.domain.tldOrg}?lang=en`,
      redirectionUrl: `${settings.domain.pixOrga + settings.domain.tldOrg}/rejoindre?invitationId=${organizationInvitationId}&code=${code}&lang=en`,
      supportUrl: HELPDESK_EN,
      ...enTranslations['organization-invitation-email'],
    };
    pixOrgaName = PIX_ORGA_NAME_EN;
    sendOrganizationInvitationEmailSubject = ORGANIZATION_INVITATION_EMAIL_SUBJECT_EN;
  }

  return mailer.sendEmail({
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: pixOrgaName,
    to: email,
    subject: sendOrganizationInvitationEmailSubject,
    template: mailer.organizationInvitationTemplateId,
    variables: templateParams,
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
  locale = locale ? locale : FRENCH_FRANCE;

  let variables = {
    organizationName,
    firstName, lastName,
    pixHomeName: `pix${settings.domain.tldFr}`,
    pixHomeUrl: `${settings.domain.pix + settings.domain.tldFr}`,
    pixOrgaHomeUrl: `${settings.domain.pixOrga + settings.domain.tldFr}`,
    redirectionUrl: `${settings.domain.pixOrga + settings.domain.tldFr}/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
    locale,
  };

  if (locale === FRENCH_SPOKEN) {
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
    fromName: PIX_ORGA_NAME_FR,
    to: email,
    subject: 'Accès à votre espace Pix Orga',
    template: mailer.organizationInvitationScoTemplateId,
    variables,
    tags: tags || null,
  });
}

function notifyEmailChange({ email, locale }) {

  const options = {
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: PIX_NAME_FR,
    to: email,
    template: mailer.emailChangeTemplateId,
    tags: [EMAIL_CHANGE_TAG],
  };

  if (locale === FRENCH_SPOKEN) {

    options.subject = frTranslations['email-change-email'].subject;

    options.variables = {
      homeName: `pix${settings.domain.tldOrg}`,
      homeUrl: `${settings.domain.pix + settings.domain.tldOrg}/fr/`,
      displayNationalLogo: false,
      ...frTranslations['email-change-email'].body,
    };

  } else if (locale === FRENCH_FRANCE) {

    options.subject = frTranslations['email-change-email'].subject;

    options.variables = {
      homeName: `pix${settings.domain.tldFr}`,
      homeUrl: `${settings.domain.pix + settings.domain.tldFr}`,
      displayNationalLogo: true,
      ...frTranslations['email-change-email'].body,
    };

  }
  else if (locale === ENGLISH_SPOKEN) {
    options.subject = enTranslations['email-change-email'].subject;

    options.variables = {
      homeName: `pix${settings.domain.tldOrg}`,
      homeUrl: `${settings.domain.pix + settings.domain.tldOrg}/en-gb/`,
      displayNationalLogo: false,
      ...enTranslations['email-change-email'].body,
    };
  }

  return mailer.sendEmail(options);
}

module.exports = {
  sendAccountCreationEmail,
  sendCertificationResultEmail,
  sendOrganizationInvitationEmail,
  sendScoOrganizationInvitationEmail,
  sendResetPasswordDemandEmail,
  notifyEmailChange,
};
