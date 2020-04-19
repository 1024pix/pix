const logger = require('../logger');
const MailingProvider = require('./MailingProvider');

class MockLogEmailProvider extends MailingProvider {

  sendEmail(options) {
    logger.info(`Faking email sending - ${JSON.stringify(options)}`);
  }
}

module.exports = MockLogEmailProvider;
