import { getI18n } from '../../infrastructure/i18n/i18n.js';
import { mailer } from '../../mail/infrastructure/services/mailer.js';
import { FRENCH_FRANCE, isFranceLocale } from '../services/locale-service.js';
import {
  getPixAppUrl,
  getPixCertifUrl,
  getPixOrgaUrl,
  getPixWebsiteDomain,
  getPixWebsiteUrl,
  getSupportUrl,
} from './url-service.js';

const EMAIL_ADDRESS_NO_RESPONSE = 'ne-pas-repondre@pix.fr';
const EMAIL_VERIFICATION_CODE_TAG = 'EMAIL_VERIFICATION_CODE';
const SCO_ACCOUNT_RECOVERY_TAG = 'SCO_ACCOUNT_RECOVERY';

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
  const i18n = getI18n(locale);

  return mailer.sendEmail({
    to: email,
    subject: i18n.__('organization-invitation-email.subject'),
    template: mailer.organizationInvitationTemplateId,
    tags: tags || null,
    variables: {
      organizationName,
      pixHomeName: getPixWebsiteDomain(locale),
      pixHomeUrl: getPixWebsiteUrl(locale),
      pixOrgaHomeUrl: getPixOrgaUrl(locale),
      redirectionUrl: getPixOrgaUrl(locale, {
        pathname: '/rejoindre',
        queryParams: { invitationId: organizationInvitationId, code },
      }),
      supportUrl: getSupportUrl(locale),
      acceptInvitation: i18n.__('organization-invitation-email.params.acceptInvitation'),
      doNotAnswer: i18n.__('organization-invitation-email.params.doNotAnswer'),
      here: i18n.__('organization-invitation-email.params.here'),
      moreAbout: i18n.__('organization-invitation-email.params.moreAbout'),
      needHelp: i18n.__('organization-invitation-email.params.needHelp'),
      oneTimeLink: i18n.__('organization-invitation-email.params.oneTimeLink'),
      pixPresentation: i18n.__('organization-invitation-email.params.pixPresentation'),
      subtitle: i18n.__('organization-invitation-email.params.subtitle'),
      title: i18n.__('organization-invitation-email.params.title'),
      yourOrganization: i18n.__('organization-invitation-email.params.yourOrganization'),
    },
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
  const i18n = getI18n(locale);

  return mailer.sendEmail({
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: i18n.__('email-sender-name.pix-orga'),
    to: email,
    subject: 'Accès à votre espace Pix Orga',
    template: mailer.organizationInvitationScoTemplateId,
    tags: tags || null,
    variables: {
      organizationName,
      firstName,
      lastName,
      pixHomeName: getPixWebsiteDomain(locale),
      pixHomeUrl: getPixWebsiteUrl(locale),
      pixOrgaHomeUrl: getPixOrgaUrl(locale),
      redirectionUrl: getPixOrgaUrl(locale, {
        pathname: '/rejoindre',
        queryParams: { invitationId: organizationInvitationId, code },
      }),
    },
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
  const i18n = getI18n(locale);

  return mailer.sendEmail({
    subject: i18n.__('certification-center-invitation-email.subject'),
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: i18n.__('email-sender-name.pix-certif'),
    to: email,
    template: mailer.certificationCenterInvitationTemplateId,
    variables: {
      certificationCenterName,
      pixHomeName: getPixWebsiteDomain(locale),
      pixHomeUrl: getPixWebsiteUrl(locale),
      pixCertifHomeUrl: getPixCertifUrl(locale),
      redirectionUrl: getPixCertifUrl(locale, {
        pathname: '/rejoindre',
        queryParams: { invitationId: certificationCenterInvitationId, code },
      }),
      supportUrl: getSupportUrl(locale),
      acceptInvitation: i18n.__('certification-center-invitation-email.params.acceptInvitation'),
      doNotAnswer: i18n.__('certification-center-invitation-email.params.doNotAnswer'),
      here: i18n.__('certification-center-invitation-email.params.here'),
      moreAbout: i18n.__('certification-center-invitation-email.params.moreAbout'),
      needHelp: i18n.__('certification-center-invitation-email.params.needHelp'),
      oneTimeLink: i18n.__('certification-center-invitation-email.params.oneTimeLink'),
      pixCertifPresentation: i18n.__('certification-center-invitation-email.params.pixCertifPresentation'),
      title: i18n.__('certification-center-invitation-email.params.title'),
      yourCertificationCenter: i18n.__('certification-center-invitation-email.params.yourCertificationCenter'),
    },
  });
}

/**
 * @param email
 * @param firstName
 * @param temporaryKey
 * @returns {Promise<EmailingAttempt>}
 */
function sendAccountRecoveryEmail({ email, firstName, temporaryKey }) {
  const i18nFr = getI18n(FRENCH_FRANCE);

  return mailer.sendEmail({
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: i18nFr.__('email-sender-name.pix-app'),
    to: email,
    subject: 'Récupération de votre compte Pix',
    template: mailer.accountRecoveryTemplateId,
    tags: [SCO_ACCOUNT_RECOVERY_TAG],
    variables: {
      firstName,
      redirectionUrl: getPixAppUrl(FRENCH_FRANCE, { pathname: `/recuperer-mon-compte/${temporaryKey}` }),
      homeName: getPixWebsiteDomain(FRENCH_FRANCE),
      choosePassword: i18nFr.__('account-recovery-email.params.choosePassword'),
      context: i18nFr.__('account-recovery-email.params.context'),
      doNotAnswer: i18nFr.__('account-recovery-email.params.doNotAnswer'),
      instruction: i18nFr.__('account-recovery-email.params.instruction'),
      linkValidFor: i18nFr.__('account-recovery-email.params.linkValidFor'),
      moreOn: i18nFr.__('account-recovery-email.params.moreOn'),
      pixPresentation: i18nFr.__('account-recovery-email.params.pixPresentation'),
      signing: i18nFr.__('account-recovery-email.params.signing'),
    },
  });
}

/**
 * @param code
 * @param email
 * @param locale
 * @returns {Promise<EmailingAttempt>}
 */
function sendVerificationCodeEmail({ code, email, locale = FRENCH_FRANCE }) {
  const i18n = getI18n(locale);

  const options = {
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: i18n.__('email-sender-name.pix-app'),
    to: email,
    template: mailer.emailVerificationCodeTemplateId,
    tags: [EMAIL_VERIFICATION_CODE_TAG],
    subject: i18n.__('verification-code-email.subject', { code }),
    variables: {
      code,
      homeName: getPixWebsiteDomain(locale),
      homeUrl: getPixWebsiteUrl(locale),
      displayNationalLogo: isFranceLocale(locale),
      context: i18n.__('verification-code-email.body.context'),
      doNotAnswer: i18n.__('verification-code-email.body.doNotAnswer'),
      greeting: i18n.__('verification-code-email.body.greeting'),
      moreOn: i18n.__('verification-code-email.body.moreOn'),
      pixPresentation: i18n.__('verification-code-email.body.pixPresentation'),
      seeYouSoon: i18n.__('verification-code-email.body.seeYouSoon'),
      signing: i18n.__('verification-code-email.body.signing'),
      warningMessage: i18n.__('verification-code-email.body.warningMessage'),
    },
  };

  return mailer.sendEmail(options);
}

function sendCpfEmail({ email, generatedFiles }) {
  const i18nFr = getI18n(FRENCH_FRANCE);

  return mailer.sendEmail({
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: i18nFr.__('email-sender-name.pix-app'),
    to: email,
    template: mailer.cpfEmailTemplateId,
    variables: { generatedFiles },
  });
}

const mailService = {
  sendAccountRecoveryEmail,
  sendOrganizationInvitationEmail,
  sendScoOrganizationInvitationEmail,
  sendCertificationCenterInvitationEmail,
  sendVerificationCodeEmail,
  sendCpfEmail,
};

/**
 * @typedef {Object} MailService
 * @property {function} sendAccountRecoveryEmail
 * @property {function} sendCertificationCenterInvitationEmail
 * @property {function} sendCpfEmail
 * @property {function} sendOrganizationInvitationEmail
 * @property {function} sendScoOrganizationInvitationEmail
 * @property {function} sendVerificationCodeEmail
 */
export {
  mailService,
  sendAccountRecoveryEmail,
  sendCertificationCenterInvitationEmail,
  sendCpfEmail,
  sendOrganizationInvitationEmail,
  sendScoOrganizationInvitationEmail,
  sendVerificationCodeEmail,
};
