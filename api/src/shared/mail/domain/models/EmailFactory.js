import { getI18n } from '../../../infrastructure/i18n/i18n.js';
import { getEmailDefaultVariables } from '../emails-default-variables.js';
import { Email } from './Email.js';

const NO_REPLY_PIX_EMAIL = 'ne-pas-repondre@pix.fr';

/**
 * Factory class to create Email instances.
 */
export class EmailFactory {
  /**
   * Creates an instance of EmailFactory.
   *
   * @param {Object} options - The options for the factory.
   * @param {string} options.app - The application name. (pix-app, pix-certif...)
   * @param {string} options.locale - The locale for i18n.
   */
  constructor({ app, locale }) {
    this.app = app;
    this.i18n = getI18n(locale);
    this.defaultVariables = getEmailDefaultVariables(locale);
  }

  /**
   * Builds an Email instance.
   *
   * @param {Object} emailParameters - The parameters for the email.
   * @param {string} emailParameters.template - The email template.
   * @param {string} [emailParameters.from] - The sender email address (optional).
   * @param {string} [emailParameters.fromName] - The sender name (optional).
   * @param {string} emailParameters.subject - The email subject.
   * @param {string} emailParameters.to - The recipient email address.
   * @param {Object} emailParameters.variables - The variables for the email template.
   * @param {Array} [emailParameters.tags] - The tags for the email (optional).
   *
   * @returns {Email} The created Email instance.
   * @throws {Error} If emailParameters are not provided.
   */
  buildEmail(emailParameters) {
    const { i18n, app } = this;

    if (!emailParameters) {
      throw new Error('Email parameters are required.');
    }

    return new Email({
      template: emailParameters.template,
      from: emailParameters.from || NO_REPLY_PIX_EMAIL,
      fromName: emailParameters.fromName || i18n.__(`email-sender-name.${app}`),
      subject: emailParameters.subject,
      to: emailParameters.to,
      variables: emailParameters.variables,
      tags: emailParameters.tags,
    });
  }
}
