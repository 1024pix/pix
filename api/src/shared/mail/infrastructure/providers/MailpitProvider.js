import { SmtpMailer } from '../services/smtp-mailer.js';
import { MailingProvider } from './MailingProvider.js';

class MailpitProvider extends MailingProvider {
  constructor() {
    super();
    this._client = MailpitProvider.createSmtpMailerClient();
  }

  static createSmtpMailerClient() {
    return new SmtpMailer();
  }

  async sendEmail({ from, fromName, to, subject, template, variables } = {}) {
    const text = JSON.stringify({ templateId: template, ...variables }, null, 2);
    const payload = { from, fromName, to, subject, text };

    await this._client.sendEmail(payload);
  }
}

export { MailpitProvider };
