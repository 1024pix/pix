import dayjs from 'dayjs';

import { LOCALE } from '../../../src/shared/domain/constants.js';
import { tokenService } from '../../../src/shared/domain/services/token-service.js';
import { mailer } from '../../../src/shared/mail/infrastructure/services/mailer.js';
import enTranslations from '../../../translations/en.json' assert { type: 'json' };
import frTranslations from '../../../translations/fr.json' assert { type: 'json' };
import { es as esTranslations } from '../../../translations/index.js';
import nlTranslations from '../../../translations/nl.json' assert { type: 'json' };
import { config } from '../../config.js';

const { ENGLISH_SPOKEN, FRENCH_FRANCE, FRENCH_SPOKEN, DUTCH_SPOKEN, SPANISH_SPOKEN } = LOCALE;

const EMAIL_ADDRESS_NO_RESPONSE = 'ne-pas-repondre@pix.fr';
const EMAIL_VERIFICATION_CODE_TAG = 'EMAIL_VERIFICATION_CODE';
const SCO_ACCOUNT_RECOVERY_TAG = 'SCO_ACCOUNT_RECOVERY';

const PIX_ORGA_NAME_FR = 'Pix Orga - Ne pas répondre';
const PIX_ORGA_NAME_EN = 'Pix Orga - Noreply';
const PIX_CERTIF_NAME_FR = 'Pix Certif - Ne pas répondre';
const PIX_CERTIF_NAME_EN = 'Pix Certif - Noreply';

// FRENCH_FRANCE
const PIX_HOME_NAME_FRENCH_FRANCE = `pix${config.domain.tldFr}`;
const PIX_HOME_URL_FRENCH_FRANCE = `${config.domain.pix + config.domain.tldFr}`;
const PIX_APP_URL_FRENCH_FRANCE = `${config.domain.pixApp + config.domain.tldFr}`;
const PIX_APP_CONNECTION_URL_FRENCH_FRANCE = `${PIX_APP_URL_FRENCH_FRANCE}/connexion`;
const PIX_ORGA_HOME_URL_FRENCH_FRANCE = `${config.domain.pixOrga + config.domain.tldFr}`;
const HELPDESK_FRENCH_FRANCE = 'https://support.pix.fr';

// INTERNATIONAL
const PIX_HOME_NAME_INTERNATIONAL = `pix${config.domain.tldOrg}`;
const PIX_HOME_URL_INTERNATIONAL = {
  en: `${config.domain.pix + config.domain.tldOrg}/en-gb/`,
  fr: `${config.domain.pix + config.domain.tldOrg}/fr/`,
  nl: `${config.domain.pix + config.domain.tldOrg}/nl-be/`,
};
const PIX_ORGA_HOME_URL_INTERNATIONAL = `${config.domain.pixOrga + config.domain.tldOrg}`;
const PIX_APP_URL_INTERNATIONAL = `${config.domain.pixApp + config.domain.tldOrg}`;
const PIX_APP_CONNECTION_URL_INTERNATIONAL = {
  en: `${PIX_APP_URL_INTERNATIONAL}/connexion/?lang=en`,
  es: `${PIX_APP_URL_INTERNATIONAL}/connexion/?lang=es`,
  fr: `${PIX_APP_URL_INTERNATIONAL}/connexion/?lang=fr`,
  nl: `${PIX_APP_URL_INTERNATIONAL}/connexion/?lang=nl`,
};
const PIX_HELPDESK_URL_INTERNATIONAL = {
  en: 'https://support.pix.org/en/support/home',
  fr: 'https://support.pix.org',
  nl: 'https://pix.org/nl-be/support',
};
const translations = {
  en: enTranslations,
  es: esTranslations,
  fr: frTranslations,
  nl: nlTranslations,
};

function _getMailerConfig(locale) {
  switch (locale) {
    case FRENCH_SPOKEN:
    case SPANISH_SPOKEN:
    case ENGLISH_SPOKEN:
    case DUTCH_SPOKEN:
      return {
        homeName: PIX_HOME_NAME_INTERNATIONAL,
        pixOrgaName: PIX_ORGA_NAME_EN,
        homeUrl: PIX_HOME_URL_INTERNATIONAL[locale] ?? PIX_HOME_URL_INTERNATIONAL.en,
        pixOrgaHomeUrl: PIX_ORGA_HOME_URL_INTERNATIONAL,
        pixAppConnectionUrl: PIX_APP_CONNECTION_URL_INTERNATIONAL[locale] ?? PIX_APP_CONNECTION_URL_INTERNATIONAL.en,
        helpdeskUrl: PIX_HELPDESK_URL_INTERNATIONAL[locale] ?? PIX_HELPDESK_URL_INTERNATIONAL.en,
        displayNationalLogo: false,
        translation: translations[locale],
      };
    default:
      return {
        homeName: PIX_HOME_NAME_FRENCH_FRANCE,
        homeUrl: PIX_HOME_URL_FRENCH_FRANCE,
        pixAppConnectionUrl: PIX_APP_CONNECTION_URL_FRENCH_FRANCE,
        helpdeskUrl: HELPDESK_FRENCH_FRANCE,
        displayNationalLogo: true,
        pixOrgaName: PIX_ORGA_NAME_FR,
        pixOrgaHomeUrl: PIX_ORGA_HOME_URL_FRENCH_FRANCE,
        translation: translations.fr,
      };
  }
}

function sendAccountCreationEmail(email, locale = FRENCH_FRANCE, redirectionUrl) {
  const mailerConfig = _getMailerConfig(locale);

  const templateVariables = {
    homeName: mailerConfig.homeName,
    homeUrl: mailerConfig.homeUrl,
    redirectionUrl: redirectionUrl || mailerConfig.pixAppConnectionUrl,
    helpdeskUrl: mailerConfig.helpdeskUrl,
    displayNationalLogo: mailerConfig.displayNationalLogo,
    ...mailerConfig.translation['pix-account-creation-email'].params,
  };
  const pixName = mailerConfig.translation['email-sender-name']['pix-app'];
  const accountCreationEmailSubject = mailerConfig.translation['pix-account-creation-email'].subject;

  return mailer.sendEmail({
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: pixName,
    to: email,
    subject: accountCreationEmailSubject,
    template: mailer.accountCreationTemplateId,
    variables: templateVariables,
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

  const templateVariables = {
    certificationCenterName,
    sessionId,
    sessionDate: formattedSessionDate,
    fr: {
      ...frTranslations['certification-result-email'].params,
      homeName: PIX_HOME_NAME_FRENCH_FRANCE,
      homeUrl: PIX_HOME_URL_FRENCH_FRANCE,
      homeNameInternational: PIX_HOME_NAME_INTERNATIONAL,
      homeUrlInternational: PIX_HOME_URL_INTERNATIONAL.fr,
      title: translate({ phrase: 'certification-result-email.title', locale: 'fr' }, { sessionId }),
      link: `${link}?lang=fr`,
    },
    en: {
      ...enTranslations['certification-result-email'].params,
      homeName: PIX_HOME_NAME_INTERNATIONAL,
      homeUrl: PIX_HOME_URL_INTERNATIONAL.en,
      title: translate({ phrase: 'certification-result-email.title', locale: 'en' }, { sessionId }),
      link: `${link}?lang=en`,
    },
  };

  return mailer.sendEmail({
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: `${frTranslations['email-sender-name']['pix-app']} / ${enTranslations['email-sender-name']['pix-app']}`,
    to: email,
    template: mailer.certificationResultTemplateId,
    variables: templateVariables,
  });
}

function sendResetPasswordDemandEmail({ email, locale = FRENCH_FRANCE, temporaryKey }) {
  const mailerConfig = _getMailerConfig(locale);

  const templateVariables = {
    locale,
    ...mailerConfig.translation['reset-password-demand-email'].params,
    homeName: mailerConfig.homeName,
    homeUrl: mailerConfig.homeUrl,
    resetUrl:
      locale === FRENCH_FRANCE
        ? `${PIX_APP_URL_FRENCH_FRANCE}/changer-mot-de-passe/${temporaryKey}`
        : `${PIX_APP_URL_INTERNATIONAL}/changer-mot-de-passe/${temporaryKey}/?lang=${locale}`,
    helpdeskURL: mailerConfig.helpdeskUrl,
  };
  const pixName = mailerConfig.translation['email-sender-name']['pix-app'];
  const resetPasswordEmailSubject = mailerConfig.translation['reset-password-demand-email'].subject;

  return mailer.sendEmail({
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: pixName,
    to: email,
    subject: resetPasswordEmailSubject,
    template: mailer.passwordResetTemplateId,
    variables: templateVariables,
  });
}

function sendOrganizationInvitationEmail({
  email,
  organizationName,
  organizationInvitationId,
  code,
  locale = FRENCH_FRANCE,
  tags,
}) {
  const mailerConfig = _getMailerConfig(locale);

  const pixOrgaName = mailerConfig.pixOrgaName;
  const sendOrganizationInvitationEmailSubject = mailerConfig.translation['organization-invitation-email'].subject;

  const templateVariables = {
    organizationName,
    pixHomeName: mailerConfig.homeName,
    pixHomeUrl: mailerConfig.homeUrl,
    pixOrgaHomeUrl: mailerConfig.pixOrgaHomeUrl + (locale === FRENCH_FRANCE ? '' : `?lang=${locale}`),
    redirectionUrl:
      `${mailerConfig.pixOrgaHomeUrl}/rejoindre?invitationId=${organizationInvitationId}&code=${code}` +
      (locale === FRENCH_FRANCE ? '' : `&lang=${locale}`),
    supportUrl: mailerConfig.helpdeskUrl,
    ...mailerConfig.translation['organization-invitation-email'].params,
  };

  return mailer.sendEmail({
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: pixOrgaName,
    to: email,
    subject: sendOrganizationInvitationEmailSubject,
    template: mailer.organizationInvitationTemplateId,
    variables: templateVariables,
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
  locale = FRENCH_FRANCE,
  tags,
}) {
  const mailerConfig = _getMailerConfig(locale);

  const templateVariables = {
    organizationName,
    firstName,
    lastName,
    pixHomeName: mailerConfig.homeName,
    pixHomeUrl: mailerConfig.homeUrl,
    pixOrgaHomeUrl: mailerConfig.pixOrgaHomeUrl,
    redirectionUrl: `${mailerConfig.pixOrgaHomeUrl}/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
    locale,
  };

  return mailer.sendEmail({
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: PIX_ORGA_NAME_FR,
    to: email,
    subject: 'Accès à votre espace Pix Orga',
    template: mailer.organizationInvitationScoTemplateId,
    variables: templateVariables,
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
    pixHomeName: PIX_HOME_NAME_FRENCH_FRANCE,
    pixHomeUrl: PIX_HOME_URL_FRENCH_FRANCE,
    pixCertifHomeUrl: `${config.domain.pixCertif + config.domain.tldFr}`,
    redirectionUrl: `${
      config.domain.pixCertif + config.domain.tldFr
    }/rejoindre?invitationId=${certificationCenterInvitationId}&code=${code}`,
    supportUrl: HELPDESK_FRENCH_FRANCE,
    ...frTranslations['certification-center-invitation-email'].params,
  };
  const frenchSpokenTemplateParams = {
    certificationCenterName,
    pixHomeName: PIX_HOME_NAME_INTERNATIONAL,
    pixHomeUrl: `${config.domain.pix + config.domain.tldOrg}`,
    pixCertifHomeUrl: `${config.domain.pixCertif + config.domain.tldOrg}`,
    redirectionUrl: `${
      config.domain.pixCertif + config.domain.tldOrg
    }/rejoindre?invitationId=${certificationCenterInvitationId}&code=${code}`,
    supportUrl: PIX_HELPDESK_URL_INTERNATIONAL.fr,
    ...frTranslations['certification-center-invitation-email'].params,
  };
  const englishSpokenTemplateParams = {
    certificationCenterName,
    pixHomeName: PIX_HOME_NAME_INTERNATIONAL,
    pixHomeUrl: PIX_HOME_URL_INTERNATIONAL.en,
    pixCertifHomeUrl: `${config.domain.pixCertif + config.domain.tldOrg}?lang=en`,
    redirectionUrl: `${
      config.domain.pixCertif + config.domain.tldOrg
    }/rejoindre?invitationId=${certificationCenterInvitationId}&code=${code}&lang=en`,
    supportUrl: PIX_HELPDESK_URL_INTERNATIONAL.en,
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
  const pixName = frTranslations['email-sender-name']['pix-app'];
  const redirectionUrl = `${PIX_APP_URL_FRENCH_FRANCE}/recuperer-mon-compte/${temporaryKey}`;
  const variables = {
    firstName,
    redirectionUrl,
    homeName: PIX_HOME_NAME_FRENCH_FRANCE,
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

function sendVerificationCodeEmail({ code, email, locale = FRENCH_FRANCE, translate }) {
  const mailerConfig = _getMailerConfig(locale);

  const options = {
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: mailerConfig.translation['email-sender-name']['pix-app'],
    to: email,
    template: mailer.emailVerificationCodeTemplateId,
    tags: [EMAIL_VERIFICATION_CODE_TAG],
    subject: translate(
      {
        phrase: 'verification-code-email.subject',
        locale: locale === FRENCH_FRANCE ? 'fr' : locale,
      },
      { code },
    ),
    variables: {
      code,
      homeName: mailerConfig.homeName,
      homeUrl: mailerConfig.homeUrl,
      displayNationalLogo: mailerConfig.displayNationalLogo,
      ...mailerConfig.translation['verification-code-email'].body,
    },
  };

  return mailer.sendEmail(options);
}

function sendCpfEmail({ email, generatedFiles }) {
  const options = {
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: frTranslations['email-sender-name']['pix-app'],
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
    fromName: frTranslations['email-sender-name']['pix-app'],
    to: email,
    template: mailer.acquiredCleaResultTemplateId,
    variables: { sessionId, sessionDate: formattedSessionDate },
  };

  return mailer.sendEmail(options);
}

function sendNotificationToOrganizationMembersForTargetProfileDetached({ email, complementaryCertificationName }) {
  const options = {
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: frTranslations['email-sender-name']['pix-app'],
    to: email,
    template: mailer.targetProfileNotCertifiableTemplateId,
    variables: { complementaryCertificationName },
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
  sendNotificationToOrganizationMembersForTargetProfileDetached,
};
export {
  mailService,
  sendAccountCreationEmail,
  sendAccountRecoveryEmail,
  sendCertificationCenterInvitationEmail,
  sendCertificationResultEmail,
  sendCpfEmail,
  sendNotificationToCertificationCenterRefererForCleaResults,
  sendNotificationToOrganizationMembersForTargetProfileDetached,
  sendOrganizationInvitationEmail,
  sendResetPasswordDemandEmail,
  sendScoOrganizationInvitationEmail,
  sendVerificationCodeEmail,
};
