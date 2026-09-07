import { BrevoClient } from '@getbrevo/brevo';
import _ from 'lodash';

import { config } from '../../../../../config/config.js';
import { MailingProviderInvalidEmailError } from '../../domain/models/MailingProviderInvalidEmailError.js';
import { MailingProvider } from './MailingProvider.js';

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

    this._client = new BrevoClient({
      apiKey: mailing.brevo.apiKey,
    });
  }

  async sendEmail(options) {
    const payload = _formatPayload(options);
    try {
      return await this._client.transactionalEmails.sendTransacEmail(payload);
    } catch (err) {
      if (err?.body?.code === 'invalid_parameter') {
        throw new MailingProviderInvalidEmailError(err?.body?.message);
      }

      throw err;
    }
  }
}

export { BrevoProvider };
