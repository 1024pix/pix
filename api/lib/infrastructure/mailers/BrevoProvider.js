import _ from 'lodash';
import Brevo from '@getbrevo/brevo';

import { MailingProvider } from './MailingProvider.js';
import { config } from '../../config.js';
import { MailingProviderInvalidEmailError } from './MailingProviderInvalidEmailError.js';

const { mailing } = config;
function _formatPayload({ to, fromName, from, subject, template, variables, tags }) {
  const payload = {
    to: [
      {
        email: to,
      },
    ],
    sender: {
      name: fromName,
      email: from,
    },
    subject,
    templateId: parseInt(template),
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
    },
  };

  if (variables) {
    payload.params = variables;
  }

  if (_.isArray(tags) && !_.isEmpty(tags)) {
    payload.tags = tags;
  }

  return payload;
}

class BrevoProvider extends MailingProvider {
  constructor() {
    super();

    const defaultClient = Brevo.ApiClient.instance;
    defaultClient.authentications['api-key'].apiKey = mailing.brevo.apiKey;

    this._client = BrevoProvider.createBrevoSMTPApi();
  }

  static createBrevoSMTPApi() {
    return new Brevo.TransactionalEmailsApi();
  }

  async sendEmail(options) {
    const payload = _formatPayload(options);
    try {
      return await this._client.sendTransacEmail(payload);
    } catch (err) {
      const responseText = JSON.parse(err.response.text);
      if (responseText.code === 'invalid_parameter') {
        throw new MailingProviderInvalidEmailError(responseText.message);
      }

      throw err;
    }
  }
}

export { BrevoProvider };
