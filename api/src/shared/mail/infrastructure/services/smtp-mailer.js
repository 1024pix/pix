import { createTransport } from 'nodemailer';

import { config } from '../../../config.js';

export class SmtpMailer {
  #transporter;

  constructor() {
    this.#transporter = SmtpMailer.createTransport();
  }

  static createTransport() {
    return createTransport(config.mailing.smtpUrl);
  }

  async sendEmail({ from, fromName, to, subject, text, html }) {
    if (!config.mailing.enabled) {
      return;
    }
    const from = fromName ? `"${fromName}" ${from}` : null;
    const transporterOptions = {
      from: `"${fromName}" ${from}`,
      to,
      subject,
      text,
      html,
    };
    if (transporterOptions.from === null) {
      delete transporterOptions.from;
    }
    await this.#transporter.sendMail(transporterOptions);
  }
}
