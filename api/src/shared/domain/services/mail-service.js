import * as translations from '../../../../translations/index.js';
import { config } from '../../config.js';
import { getEmailDefaultVariables } from '../../mail/domain/emails-default-variables.js';
import { mailer } from '../../mail/infrastructure/services/mailer.js';
import {
  DUTCH_SPOKEN,
  ENGLISH_SPOKEN,
  FRENCH_FRANCE,
  FRENCH_SPOKEN,
  SPANISH_SPOKEN,
} from '../services/locale-service.js';

const EMAIL_ADDRESS_NO_RESPONSE = 'ne-pas-repondre@pix.fr';
const EMAIL_VERIFICATION_CODE_TAG = 'EMAIL_VERIFICATION_CODE';
const SCO_ACCOUNT_RECOVERY_TAG = 'SCO_ACCOUNT_RECOVERY';

// FRENCH_FRANCE
const PIX_APP_URL_FRENCH_FRANCE = `${config.domain.pixApp + config.domain.tldFr}`;

/**
 * @param email
 * @param organizationName
 * @param organizationInvitationId
 * @param code
 * @param locale
 * @param tags
 * @returns {Promise<EmailingAttempt>}
 */
function sendOrganizationInvitationEmail({
  email,
  organizationName,
  organizationInvitationId,
  code,
  locale = FRENCH_FRANCE,
  tags,
}) {
  const mailerConfig = _getMailerConfig(locale);

  const pixOrgaName = mailerConfig.translation['email-sender-name']['pix-orga'];
  const sendOrganizationInvitationEmailSubject = mailerConfig.translation['organization-invitation-email'].subject;

  const templateVariables = {
    organizationName,
    pixHomeName: mailerConfig.homeName,
    pixHomeUrl: mailerConfig.homeUrl,
    pixOrgaHomeUrl: _formatUrlWithLocale(mailerConfig.pixOrgaHomeUrl, locale),
    redirectionUrl: _formatUrlWithLocale(
      `${mailerConfig.pixOrgaHomeUrl}/rejoindre?invitationId=${organizationInvitationId}&code=${code}`,
      locale,
    ),
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

/**
 * @param email
 * @param organizationName
 * @param firstName
 * @param lastName
 * @param organizationInvitationId
 * @param code
 * @param locale
 * @param tags
 * @returns {Promise<EmailingAttempt>}
 */
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
    fromName: mailerConfig.translation['email-sender-name']['pix-orga'],
    to: email,
    subject: 'Accès à votre espace Pix Orga',
    template: mailer.organizationInvitationScoTemplateId,
    variables: templateVariables,
    tags: tags || null,
  });
}

/**
 * @param email
 * @param certificationCenterName
 * @param certificationCenterInvitationId
 * @param code
 * @param locale
 * @returns {Promise<EmailingAttempt>}
 */
function sendCertificationCenterInvitationEmail({
  email,
  certificationCenterName,
  certificationCenterInvitationId,
  code,
  locale = FRENCH_FRANCE,
}) {
  const mailerConfig = _getMailerConfig(locale);

  const subject = mailerConfig.translation['certification-center-invitation-email'].subject;
  const fromName = mailerConfig.translation['email-sender-name']['pix-certif'];
  const templateVariables = {
    certificationCenterName,
    pixHomeName: mailerConfig.homeName,
    pixHomeUrl: mailerConfig.homeUrl,
    pixCertifHomeUrl: _formatUrlWithLocale(mailerConfig.pixCertifHomeUrl, locale),
    redirectionUrl: _formatUrlWithLocale(
      `${mailerConfig.pixCertifHomeUrl}/rejoindre?invitationId=${certificationCenterInvitationId}&code=${code}`,
      locale,
    ),
    supportUrl: mailerConfig.helpdeskUrl,
    ...mailerConfig.translation['certification-center-invitation-email'].params,
  };

  return mailer.sendEmail({
    subject,
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName,
    to: email,
    template: mailer.certificationCenterInvitationTemplateId,
    variables: templateVariables,
  });
}

/**
 * @param email
 * @param firstName
 * @param temporaryKey
 * @returns {Promise<EmailingAttempt>}
 */
function sendAccountRecoveryEmail({ email, firstName, temporaryKey }) {
  const mailerConfig = _getMailerConfig(FRENCH_FRANCE);
  const fromName = mailerConfig.translation['email-sender-name']['pix-app'];
  const redirectionUrl = `${PIX_APP_URL_FRENCH_FRANCE}/recuperer-mon-compte/${temporaryKey}`;
  const templateVariables = {
    firstName,
    redirectionUrl,
    homeName: mailerConfig.homeName,
    ...mailerConfig.translation['account-recovery-email'].params,
  };

  return mailer.sendEmail({
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName,
    to: email,
    subject: 'Récupération de votre compte Pix',
    template: mailer.accountRecoveryTemplateId,
    tags: [SCO_ACCOUNT_RECOVERY_TAG],
    variables: templateVariables,
  });
}

/**
 * @param code
 * @param email
 * @param locale
 * @param translate
 * @returns {Promise<EmailingAttempt>}
 */
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
    fromName: translations.fr['email-sender-name']['pix-app'],
    to: email,
    template: mailer.cpfEmailTemplateId,
    variables: { generatedFiles },
  };

  return mailer.sendEmail(options);
}

function sendNotificationToOrganizationMembersForTargetProfileDetached({ email, complementaryCertificationName }) {
  const options = {
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: translations.fr['email-sender-name']['pix-app'],
    to: email,
    template: mailer.targetProfileNotCertifiableTemplateId,
    variables: { complementaryCertificationName },
  };

  return mailer.sendEmail(options);
}

/**
 * @typedef {Object} mailerConfig
 * @property {string} homeName
 * @property {string} homeUrl
 * @property {string} pixOrgaHomeUrl
 * @property {string} pixCertifHomeUrl
 * @property {string} pixAppConnectionUrl
 * @property {string} helpdeskUrl
 * @property {boolean} displayNationalLogo
 * @property {JSON} translation
 */

/**
 * @param locale
 * @returns {mailerConfig}
 * @private
 */
function _getMailerConfig(locale) {
  const defaultVariables = getEmailDefaultVariables(locale);

  switch (locale) {
    case FRENCH_SPOKEN:
    case SPANISH_SPOKEN:
    case ENGLISH_SPOKEN:
    case DUTCH_SPOKEN:
      return {
        ...defaultVariables,
        translation: translations[locale],
      };
    default:
      return {
        ...defaultVariables,
        translation: translations.fr,
      };
  }
}

/**
 * @param url
 * @param locale
 * @returns {string}
 * @private
 */
function _formatUrlWithLocale(url, locale) {
  const formattedUrl = new URL(url);

  if (locale !== FRENCH_FRANCE) {
    formattedUrl.searchParams.set('lang', locale);
  }

  return formattedUrl.toString();
}

const mailService = {
  sendAccountRecoveryEmail,
  sendOrganizationInvitationEmail,
  sendScoOrganizationInvitationEmail,
  sendCertificationCenterInvitationEmail,
  sendVerificationCodeEmail,
  sendCpfEmail,
  sendNotificationToOrganizationMembersForTargetProfileDetached,
};

/**
 * @typedef {Object} MailService
 * @property {function} sendAccountRecoveryEmail
 * @property {function} sendCertificationCenterInvitationEmail
 * @property {function} sendCpfEmail
 * @property {function} sendNotificationToOrganizationMembersForTargetProfileDetached
 * @property {function} sendOrganizationInvitationEmail
 * @property {function} sendScoOrganizationInvitationEmail
 * @property {function} sendVerificationCodeEmail
 */
export {
  mailService,
  sendAccountRecoveryEmail,
  sendCertificationCenterInvitationEmail,
  sendCpfEmail,
  sendNotificationToOrganizationMembersForTargetProfileDetached,
  sendOrganizationInvitationEmail,
  sendScoOrganizationInvitationEmail,
  sendVerificationCodeEmail,
};
