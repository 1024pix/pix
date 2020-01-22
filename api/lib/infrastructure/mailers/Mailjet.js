const _ = require('lodash');
const Mailer = require('./Mailer');
const { mailing } = require('../../config');
const nodeMailjet = require('node-mailjet');
const logger = require('../logger');
const mailCheck = require('../mail-check');

function _formatPayload(options) {

  const configuration = _.defaults(options, {
    from: 'communaute@pix.fr',
    fromName: 'Communauté PIX',
    to: null,
    subject: 'Bienvenue dans la communauté PIX',
    template: null
  });
  const variables = configuration.variables || {};
  return {
    'FromEmail': configuration.from,
    'FromName': configuration.fromName,
    'Subject': configuration.subject,
    'MJ-TemplateID': configuration.template,
    'MJ-TemplateLanguage': 'true',
    'Recipients': [{ 'Email': configuration.to, 'Vars': variables }]
  };
}

class Mailjet extends Mailer {

  constructor() {
    super();

    const provider = mailing[mailing.provider];
    this._apiInstance = nodeMailjet.connect(provider.apiKey, provider.apiSecret);
  }

  _doSendEmail(options) {
    const payload = _formatPayload(options);
    return this._apiInstance.post('send').request(payload);
  }

  sendEmail(options) {
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

module.exports = Mailjet;
