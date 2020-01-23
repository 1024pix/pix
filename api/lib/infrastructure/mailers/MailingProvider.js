const { mailing } = require('../../config');
const logger = require('../logger');
const mailCheck = require('../mail-check');

class MailingProvider {

  async _doSendEmail(/* options */) {
    throw new Error('Method #_doSendEmail(options) must be overridden');
  }

  async sendEmail(options) {
    if (!mailing.enabled) {
      return Promise.resolve();
    }

    return mailCheck.checkMail(options.to)
      .then(() => {
        return this._doSendEmail(options)
          .catch((err) => {
            logger.warn({ err }, `Could not send email to '${options.to}'`);
          });
      })
      .catch((err) => {
        logger.warn({ err }, `Email is not valid '${options.to}'`);
      });
  }
}

module.exports = MailingProvider;
