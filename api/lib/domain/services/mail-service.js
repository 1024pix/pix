import dayjs from 'dayjs';

import { tokenService } from './token-service.js';
import { mailer } from '../../infrastructure/mailers/mailer.js';
import { config } from '../../config.js';

import frTranslations from '../../../translations/fr.json' assert { type: 'json' };
import enTranslations from '../../../translations/en.json' assert { type: 'json' };

import { LOCALE } from '../../domain/constants.js';

const { ENGLISH_SPOKEN, FRENCH_FRANCE, FRENCH_SPOKEN } = LOCALE;

const EMAIL_ADDRESS_NO_RESPONSE = 'ne-pas-repondre@pix.fr';
const PIX_ORGA_NAME_FR = 'Pix Orga - Ne pas répondre';
const PIX_ORGA_NAME_EN = 'Pix Orga - Noreply';
const PIX_CERTIF_NAME_FR = 'Pix Certif - Ne pas répondre';
const PIX_CERTIF_NAME_EN = 'Pix Certif - Noreply';
const PIX_NAME_FR = 'PIX - Ne pas répondre';
const PIX_NAME_EN = 'PIX - Noreply';
const HELPDESK_FRENCH_FRANCE = 'https://support.pix.fr';
const HELPDESK_ENGLISH_SPOKEN = 'https://support.pix.org/en/support/home';
const HELPDESK_FRENCH_SPOKEN = 'https://support.pix.org';
const PIX_HOME_NAME_INTERNATIONAL = `pix${config.domain.tldOrg}`;
const PIX_HOME_NAME_FRENCH_FRANCE = `pix${config.domain.tldFr}`;
const PIX_HOME_URL_INTERNATIONAL_ENGLISH_SPOKEN = `${config.domain.pix + config.domain.tldOrg}/en-gb`;
const PIX_HOME_URL_INTERNATIONAL_FRENCH_SPOKEN = `${config.domain.pix + config.domain.tldOrg}/fr`;
const PIX_HOME_URL_FRENCH_FRANCE = `${config.domain.pix + config.domain.tldFr}`;

const EMAIL_VERIFICATION_CODE_TAG = 'EMAIL_VERIFICATION_CODE';
const SCO_ACCOUNT_RECOVERY_TAG = 'SCO_ACCOUNT_RECOVERY';

function sendAccountCreationEmail(email, locale, redirectionUrl) {
  let pixName;
  let accountCreationEmailSubject;
  let variables;

  if (locale === FRENCH_SPOKEN) {
    variables = {
      homeName: `pix${config.domain.tldOrg}`,
      homeUrl: `${config.domain.pix + config.domain.tldOrg}/fr/`,
      redirectionUrl: redirectionUrl || `${config.domain.pixApp + config.domain.tldOrg}/connexion/?lang=fr`,
      helpdeskUrl: HELPDESK_FRENCH_SPOKEN,
      displayNationalLogo: false,
      ...frTranslations['pix-account-creation-email'].params,
    };

    pixName = PIX_NAME_FR;
    accountCreationEmailSubject = frTranslations['pix-account-creation-email'].subject;
  } else if (locale === ENGLISH_SPOKEN) {
    variables = {
      homeName: `pix${config.domain.tldOrg}`,
      homeUrl: `${config.domain.pix + config.domain.tldOrg}/en-gb/`,
      redirectionUrl: redirectionUrl || `${config.domain.pixApp + config.domain.tldOrg}/connexion/?lang=en`,
      helpdeskUrl: HELPDESK_ENGLISH_SPOKEN,
      displayNationalLogo: false,
      ...enTranslations['pix-account-creation-email'].params,
    };

    pixName = PIX_NAME_EN;
    accountCreationEmailSubject = enTranslations['pix-account-creation-email'].subject;
  } else {
    variables = {
      homeName: `pix${config.domain.tldFr}`,
      homeUrl: `${config.domain.pix + config.domain.tldFr}`,
      redirectionUrl: redirectionUrl || `${config.domain.pixApp + config.domain.tldFr}/connexion`,
      helpdeskUrl: HELPDESK_FRENCH_FRANCE,
      displayNationalLogo: true,
      ...frTranslations['pix-account-creation-email'].params,
    };

    pixName = PIX_NAME_FR;
    accountCreationEmailSubject = frTranslations['pix-account-creation-email'].subject;
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
  translate,
}) {
  const token = tokenService.createCertificationResultsByRecipientEmailLinkToken({
    sessionId,
    resultRecipientEmail,
    daysBeforeExpiration,
  });
  const link = `${config.domain.pixApp + config.domain.tldOrg}/api/sessions/download-results/${token}`;

  const formattedSessionDate = dayjs(sessionDate).locale('fr').format('DD/MM/YYYY');

  const templateParams = {
    certificationCenterName,
    sessionId,
    sessionDate: formattedSessionDate,
    fr: {
      ...frTranslations['certification-result-email'].params,
      homeName: PIX_HOME_NAME_FRENCH_FRANCE,
      homeUrl: PIX_HOME_URL_FRENCH_FRANCE,
      homeNameInternational: PIX_HOME_NAME_INTERNATIONAL,
      homeUrlInternational: PIX_HOME_URL_INTERNATIONAL_FRENCH_SPOKEN,
      title: translate({ phrase: 'certification-result-email.title', locale: 'fr' }, { sessionId }),
      link: `${link}?lang=fr`,
    },
    en: {
      ...enTranslations['certification-result-email'].params,
      homeName: PIX_HOME_NAME_INTERNATIONAL,
      homeUrl: PIX_HOME_URL_INTERNATIONAL_ENGLISH_SPOKEN,
      title: translate({ phrase: 'certification-result-email.title', locale: 'en' }, { sessionId }),
      link: `${link}?lang=en`,
    },
  };

  return mailer.sendEmail({
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: `${PIX_NAME_FR} / ${PIX_NAME_EN}`,
    to: email,
    template: mailer.certificationResultTemplateId,
    variables: templateParams,
  });
}

function sendResetPasswordDemandEmail({ email, locale, temporaryKey }) {
  const localeParam = locale ? locale : FRENCH_FRANCE;

  let pixName = PIX_NAME_FR;
  let resetPasswordEmailSubject = frTranslations['reset-password-demand-email'].subject;

  let templateParams = {
    locale: localeParam,
    ...frTranslations['reset-password-demand-email'].params,
    homeName: `pix${config.domain.tldFr}`,
    homeUrl: `${config.domain.pix + config.domain.tldFr}`,
    resetUrl: `${config.domain.pixApp + config.domain.tldFr}/changer-mot-de-passe/${temporaryKey}`,
    helpdeskURL: HELPDESK_FRENCH_FRANCE,
  };

  if (localeParam === FRENCH_SPOKEN) {
    templateParams = {
      ...templateParams,
      homeName: `pix${config.domain.tldOrg}`,
      homeUrl: `${config.domain.pix + config.domain.tldOrg}/fr/`,
      resetUrl: `${config.domain.pixApp + config.domain.tldOrg}/changer-mot-de-passe/${temporaryKey}/?lang=fr`,
      helpdeskURL: HELPDESK_FRENCH_SPOKEN,
    };
  }

  if (localeParam === ENGLISH_SPOKEN) {
    templateParams = {
      locale: localeParam,
      ...enTranslations['reset-password-demand-email'].params,
      homeName: `pix${config.domain.tldOrg}`,
      homeUrl: `${config.domain.pix + config.domain.tldOrg}/en-gb/`,
      resetUrl: `${config.domain.pixApp + config.domain.tldOrg}/changer-mot-de-passe/${temporaryKey}/?lang=en`,
      helpdeskURL: HELPDESK_ENGLISH_SPOKEN,
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

function sendOrganizationInvitationEmail({ email, organizationName, organizationInvitationId, code, locale, tags }) {
  locale = locale ? locale : FRENCH_FRANCE;
  let pixOrgaName = PIX_ORGA_NAME_FR;
  let sendOrganizationInvitationEmailSubject = frTranslations['organization-invitation-email'].subject;

  let templateParams = {
    organizationName,
    pixHomeName: `pix${config.domain.tldFr}`,
    pixHomeUrl: `${config.domain.pix + config.domain.tldFr}`,
    pixOrgaHomeUrl: `${config.domain.pixOrga + config.domain.tldFr}`,
    redirectionUrl: `${
      config.domain.pixOrga + config.domain.tldFr
    }/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
    supportUrl: HELPDESK_FRENCH_FRANCE,
    ...frTranslations['organization-invitation-email'].params,
  };

  if (locale === FRENCH_SPOKEN) {
    templateParams = {
      organizationName,
      pixHomeName: `pix${config.domain.tldOrg}`,
      pixHomeUrl: `${config.domain.pix + config.domain.tldOrg}`,
      pixOrgaHomeUrl: `${config.domain.pixOrga + config.domain.tldOrg}`,
      redirectionUrl: `${
        config.domain.pixOrga + config.domain.tldOrg
      }/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
      supportUrl: HELPDESK_FRENCH_SPOKEN,
      ...frTranslations['organization-invitation-email'].params,
    };
  }

  if (locale === ENGLISH_SPOKEN) {
    templateParams = {
      organizationName,
      pixHomeName: `pix${config.domain.tldOrg}`,
      pixHomeUrl: `${config.domain.pix + config.domain.tldOrg}/en-gb/`,
      pixOrgaHomeUrl: `${config.domain.pixOrga + config.domain.tldOrg}?lang=en`,
      redirectionUrl: `${
        config.domain.pixOrga + config.domain.tldOrg
      }/rejoindre?invitationId=${organizationInvitationId}&code=${code}&lang=en`,
      supportUrl: HELPDESK_ENGLISH_SPOKEN,
      ...enTranslations['organization-invitation-email'].params,
    };
    pixOrgaName = PIX_ORGA_NAME_EN;
    sendOrganizationInvitationEmailSubject = enTranslations['organization-invitation-email'].subject;
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
  firstName,
  lastName,
  organizationInvitationId,
  code,
  locale,
  tags,
}) {
  locale = locale ? locale : FRENCH_FRANCE;

  let variables = {
    organizationName,
    firstName,
    lastName,
    pixHomeName: `pix${config.domain.tldFr}`,
    pixHomeUrl: `${config.domain.pix + config.domain.tldFr}`,
    pixOrgaHomeUrl: `${config.domain.pixOrga + config.domain.tldFr}`,
    redirectionUrl: `${
      config.domain.pixOrga + config.domain.tldFr
    }/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
    locale,
  };

  if (locale === FRENCH_SPOKEN) {
    variables = {
      organizationName,
      firstName,
      lastName,
      pixHomeName: `pix${config.domain.tldOrg}`,
      pixHomeUrl: `${config.domain.pix + config.domain.tldOrg}`,
      pixOrgaHomeUrl: `${config.domain.pixOrga + config.domain.tldOrg}`,
      redirectionUrl: `${
        config.domain.pixOrga + config.domain.tldOrg
      }/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
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

function sendCertificationCenterInvitationEmail({
  email,
  certificationCenterName,
  certificationCenterInvitationId,
  code,
  locale,
}) {
  let templateParams, fromName, subject;
  const frenchFranceTemplateParams = {
    certificationCenterName,
    pixHomeName: `pix${config.domain.tldFr}`,
    pixHomeUrl: `${config.domain.pix + config.domain.tldFr}`,
    pixCertifHomeUrl: `${config.domain.pixCertif + config.domain.tldFr}`,
    redirectionUrl: `${
      config.domain.pixCertif + config.domain.tldFr
    }/rejoindre?invitationId=${certificationCenterInvitationId}&code=${code}`,
    supportUrl: HELPDESK_FRENCH_FRANCE,
    ...frTranslations['certification-center-invitation-email'].params,
  };
  const frenchSpokenTemplateParams = {
    certificationCenterName,
    pixHomeName: `pix${config.domain.tldOrg}`,
    pixHomeUrl: `${config.domain.pix + config.domain.tldOrg}`,
    pixCertifHomeUrl: `${config.domain.pixCertif + config.domain.tldOrg}`,
    redirectionUrl: `${
      config.domain.pixCertif + config.domain.tldOrg
    }/rejoindre?invitationId=${certificationCenterInvitationId}&code=${code}`,
    supportUrl: HELPDESK_FRENCH_SPOKEN,
    ...frTranslations['certification-center-invitation-email'].params,
  };
  const englishSpokenTemplateParams = {
    certificationCenterName,
    pixHomeName: `pix${config.domain.tldOrg}`,
    pixHomeUrl: `${config.domain.pix + config.domain.tldOrg}/en-gb/`,
    pixCertifHomeUrl: `${config.domain.pixCertif + config.domain.tldOrg}?lang=en`,
    redirectionUrl: `${
      config.domain.pixCertif + config.domain.tldOrg
    }/rejoindre?invitationId=${certificationCenterInvitationId}&code=${code}&lang=en`,
    supportUrl: HELPDESK_ENGLISH_SPOKEN,
    ...enTranslations['certification-center-invitation-email'].params,
  };

  switch (locale) {
    case FRENCH_SPOKEN:
      templateParams = frenchSpokenTemplateParams;
      subject = frTranslations['certification-center-invitation-email'].subject;
      fromName = PIX_CERTIF_NAME_FR;
      break;

    case ENGLISH_SPOKEN:
      templateParams = englishSpokenTemplateParams;
      fromName = PIX_CERTIF_NAME_EN;
      subject = enTranslations['certification-center-invitation-email'].subject;
      break;

    default:
      templateParams = frenchFranceTemplateParams;
      subject = frTranslations['certification-center-invitation-email'].subject;
      fromName = PIX_CERTIF_NAME_FR;
      break;
  }

  return mailer.sendEmail({
    subject,
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName,
    to: email,
    template: mailer.certificationCenterInvitationTemplateId,
    variables: templateParams,
  });
}

function sendAccountRecoveryEmail({ email, firstName, temporaryKey }) {
  const pixName = PIX_NAME_FR;
  const redirectionUrl = `${config.domain.pixApp + config.domain.tldFr}/recuperer-mon-compte/${temporaryKey}`;
  const variables = {
    firstName,
    redirectionUrl,
    homeName: `pix${config.domain.tldFr}`,
    ...frTranslations['account-recovery-email'].params,
  };

  return mailer.sendEmail({
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: pixName,
    to: email,
    subject: 'Récupération de votre compte Pix',
    template: mailer.accountRecoveryTemplateId,
    tags: [SCO_ACCOUNT_RECOVERY_TAG],
    variables,
  });
}

function sendVerificationCodeEmail({ code, email, locale, translate }) {
  const options = {
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: PIX_NAME_FR,
    to: email,
    template: mailer.emailVerificationCodeTemplateId,
    tags: [EMAIL_VERIFICATION_CODE_TAG],
  };

  if (locale === FRENCH_SPOKEN) {
    options.subject = translate({ phrase: 'verification-code-email.subject', locale: 'fr' }, { code });

    options.variables = {
      code,
      homeName: `pix${config.domain.tldOrg}`,
      homeUrl: `${config.domain.pix + config.domain.tldOrg}/fr/`,
      displayNationalLogo: false,
      ...frTranslations['verification-code-email'].body,
    };
  } else if (locale === FRENCH_FRANCE) {
    options.subject = translate({ phrase: 'verification-code-email.subject', locale: 'fr' }, { code });

    options.variables = {
      code,
      homeName: `pix${config.domain.tldFr}`,
      homeUrl: `${config.domain.pix + config.domain.tldFr}`,
      displayNationalLogo: true,
      ...frTranslations['verification-code-email'].body,
    };
  } else if (locale === ENGLISH_SPOKEN) {
    options.subject = translate({ phrase: 'verification-code-email.subject', locale: 'en' }, { code });

    options.variables = {
      code,
      homeName: `pix${config.domain.tldOrg}`,
      homeUrl: `${config.domain.pix + config.domain.tldOrg}/en-gb/`,
      displayNationalLogo: false,
      ...enTranslations['verification-code-email'].body,
    };
  }

  return mailer.sendEmail(options);
}

function sendCpfEmail({ email, generatedFiles }) {
  const options = {
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: PIX_NAME_FR,
    to: email,
    template: mailer.cpfEmailTemplateId,
    variables: { generatedFiles },
  };

  return mailer.sendEmail(options);
}

function sendNotificationToCertificationCenterRefererForCleaResults({ email, sessionId, sessionDate }) {
  const formattedSessionDate = dayjs(sessionDate).locale('fr').format('DD/MM/YYYY');

  const options = {
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: PIX_NAME_FR,
    to: email,
    template: mailer.acquiredCleaResultTemplateId,
    variables: { sessionId, sessionDate: formattedSessionDate },
  };

  return mailer.sendEmail(options);
}

const mailService = {
  sendAccountCreationEmail,
  sendAccountRecoveryEmail,
  sendCertificationResultEmail,
  sendOrganizationInvitationEmail,
  sendScoOrganizationInvitationEmail,
  sendCertificationCenterInvitationEmail,
  sendResetPasswordDemandEmail,
  sendVerificationCodeEmail,
  sendCpfEmail,
  sendNotificationToCertificationCenterRefererForCleaResults,
};
export {
  sendAccountCreationEmail,
  sendAccountRecoveryEmail,
  sendCertificationResultEmail,
  sendOrganizationInvitationEmail,
  sendScoOrganizationInvitationEmail,
  sendCertificationCenterInvitationEmail,
  sendResetPasswordDemandEmail,
  sendVerificationCodeEmail,
  sendCpfEmail,
  sendNotificationToCertificationCenterRefererForCleaResults,
  mailService,
};
