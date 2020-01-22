class Mailer {

  async sendEmail(/* options */) {
    throw new Error('Method #sendEmail(options) must be overridden');
  }
}

module.exports = Mailer;
