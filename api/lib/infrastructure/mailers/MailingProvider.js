class MailingProvider {

  async sendEmail(/* options */) {
    throw new Error('Method #sendEmail(options) must be overridden');
  }

}

module.exports = MailingProvider;
