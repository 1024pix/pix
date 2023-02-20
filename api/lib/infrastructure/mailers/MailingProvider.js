class MailingProvider {
  async sendEmail(/* options */) {
    throw new Error('Method #sendEmail(options) must be overridden');
  }
}

export default MailingProvider;
