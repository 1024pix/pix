import { FRENCH_FRANCE } from '../../../shared/domain/services/locale-service.js';
import { urlBuilder } from '../../../shared/infrastructure/utils/url-builder.js';
import { EmailFactory } from '../../../shared/mail/domain/models/EmailFactory.js';
import { mailer } from '../../../shared/mail/infrastructure/services/mailer.js';

/**
 * Creates an email to warn users for suspicious connection.
 *
 * @param {Object} params - The parameters for creating the email.
 * @param {string} params.locale - The locale for the email.
 * @param {string} params.email - The recipient's email address.
 * @param {string} params.firstName - The recipient's first name.
 * @param {string} params.validationToken - The token for email validation.
 * @returns {Email} The email object.
 */
export function createWarningConnectionEmail({ locale, email, firstName, validationToken }) {
  locale = locale || FRENCH_FRANCE;
  const lang = new Intl.Locale(locale).language;
  let localeSupport;
  if (locale.toLowerCase() === FRENCH_FRANCE) {
    localeSupport = FRENCH_FRANCE;
  } else {
    localeSupport = lang;
  }

  const factory = new EmailFactory({ app: 'pix-app', locale: localeSupport });

  const { i18n, defaultVariables } = factory;
  const pixAppUrl = urlBuilder.getPixAppBaseUrl(locale);
  const resetUrl = `${pixAppUrl}/mot-de-passe-oublie?lang=${lang}&email=${encodeURIComponent(email)}`;

  return factory.buildEmail({
    template: mailer.warningConnectionTemplateId,
    subject: i18n.__('warning-connection-email.subject'),
    to: email,
    variables: {
      homeName: defaultVariables.homeName,
      homeUrl: defaultVariables.homeUrl,
      helpDeskUrl: urlBuilder.getEmailValidationUrl({
        locale: localeSupport,
        redirectUrl: defaultVariables.helpdeskUrl,
        token: validationToken,
      }),
      displayNationalLogo: defaultVariables.displayNationalLogo,
      contactUs: i18n.__('common.email.contactUs'),
      doNotAnswer: i18n.__('common.email.doNotAnswer'),
      moreOn: i18n.__('common.email.moreOn'),
      pixPresentation: i18n.__('common.email.pixPresentation'),
      hello: i18n.__('warning-connection-email.params.hello', { firstName }),
      context: i18n.__('warning-connection-email.params.context'),
      disclaimer: i18n.__('warning-connection-email.params.disclaimer'),
      warningMessage: i18n.__('warning-connection-email.params.warningMessage'),
      resetMyPassword: i18n.__('warning-connection-email.params.resetMyPassword'),
      resetUrl: urlBuilder.getEmailValidationUrl({
        locale: localeSupport,
        redirectUrl: resetUrl,
        token: validationToken,
      }),
      supportContact: i18n.__('warning-connection-email.params.supportContact'),
      thanks: i18n.__('warning-connection-email.params.thanks'),
      signing: i18n.__('warning-connection-email.params.signing'),
    },
  });
}
