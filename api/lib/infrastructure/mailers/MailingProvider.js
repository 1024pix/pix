class MailingProvider {

  // eslint-disable-next-line require-await
  async sendEmail(/* options */) {
    throw new Error('Method #sendEmail(options) must be overridden');
  }

}

module.exports = MailingProvider;
