import { getI18n } from '../../infrastructure/i18n/i18n.js';
import { mailer } from '../../mail/infrastructure/services/mailer.js';
import { FRENCH_FRANCE } from '../services/locale-service.js';
import {
  getPixAppUrl,
  getPixCertifUrl,
  getPixOrgaUrl,
  getPixWebsiteDomain,
  getPixWebsiteUrl,
  getSupportUrl,
} from './url-service.js';

const EMAIL_ADDRESS_NO_RESPONSE = 'ne-pas-repondre@pix.fr';
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
export function sendOrganizationInvitationEmail({
  email,
  organizationName,
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
export function sendScoOrganizationInvitationEmail({
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
export function sendCertificationCenterInvitationEmail({
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
export function sendAccountRecoveryEmail({ email, firstName, temporaryKey }) {
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

export function sendCpfEmail({ email, generatedFiles }) {
  const i18nFr = getI18n(FRENCH_FRANCE);

  return mailer.sendEmail({
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: i18nFr.__('email-sender-name.pix-app'),
    to: email,
    template: mailer.cpfEmailTemplateId,
    variables: { generatedFiles },
  });
}

export const mailService = {
  sendAccountRecoveryEmail,
  sendOrganizationInvitationEmail,
  sendScoOrganizationInvitationEmail,
  sendCertificationCenterInvitationEmail,
  sendCpfEmail,
};
