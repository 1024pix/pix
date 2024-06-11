class MailingProvider {
  /**
   * @param {Object} options
   * @param {string} options.from sender email
   * @param {string} options.fromName sender fullname
   * @param {string} options.to recipient email
   * @param {string} options.subject email subject
   * @param {string} options.template template id
   * @param {Object} options.variables record containing template variables (key-value)
   */
  async sendEmail(/* options */) {
    throw new Error('Method #sendEmail(options) must be overridden');
  }
}

export { MailingProvider };
