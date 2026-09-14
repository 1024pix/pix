import { FRENCH_FRANCE } from '../../../shared/domain/services/locale-service.js';
import {
  getPixAppUrl,
  getPixWebsiteDomain,
  getPixWebsiteUrl,
  getSupportUrl,
} from '../../../shared/domain/services/url-service.js';
import { EmailFactory } from '../../../shared/mail/domain/models/EmailFactory.js';
import { mailer } from '../../../shared/mail/infrastructure/services/mailer.js';

/**
 * Creates a reset password demand email.
 *
 * @param {Object} params - The parameters for the email.
 * @param {string} params.email - The recipient's email address.
 * @param {string} params.temporaryKey - The temporary key for resetting the password.
 * @param {string} params.locale - The locale for the email.
 * @returns {Email} - The email instance.
 */
export function createResetPasswordDemandEmail({ email, temporaryKey, locale = FRENCH_FRANCE }) {
  const factory = new EmailFactory({ app: 'pix-app', locale });

  const { i18n } = factory;

  return factory.buildEmail({
    template: mailer.passwordResetTemplateId,
    subject: i18n.__('reset-password-demand-email.subject'),
    to: email,
    variables: {
      homeName: getPixWebsiteDomain(locale),
      homeUrl: getPixWebsiteUrl(locale),
      helpdeskUrl: getSupportUrl(locale),
      resetUrl: getPixAppUrl(locale, { pathname: '/changer-mot-de-passe', hash: temporaryKey }),
      clickOnTheButton: i18n.__('reset-password-demand-email.params.clickOnTheButton'),
      contactUs: i18n.__('reset-password-demand-email.params.contactUs'),
      doNotAnswer: i18n.__('reset-password-demand-email.params.doNotAnswer'),
      linkValidFor: i18n.__('reset-password-demand-email.params.linkValidFor'),
      moreOn: i18n.__('reset-password-demand-email.params.moreOn'),
      pixPresentation: i18n.__('reset-password-demand-email.params.pixPresentation'),
      resetMyPassword: i18n.__('reset-password-demand-email.params.resetMyPassword'),
      title: i18n.__('reset-password-demand-email.params.title'),
      weCannotSendYourPassword: i18n.__('reset-password-demand-email.params.weCannotSendYourPassword'),
    },
  });
}
