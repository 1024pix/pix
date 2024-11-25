import { Email } from '../../domain/models/Email.js';
import { mailer as mailerService } from '../services/mailer.js';
import { sendEmailJobRepository } from './jobs/send-email.job-repository.js';

/**
 * Send an email synchronously
 *
 * @param {Email} email Email instance
 * @returns Promise<EmailingAttempt>
 */
async function sendEmail(email, dependencies = { mailerService }) {
  if (!email || !(email instanceof Email)) {
    throw new Error('An instance of Email is required.');
  }

  return dependencies.mailerService.sendEmail(email.payload);
}

/**
 * Send an email asynchronously via a Job
 *
 * @param {Email} email Email instance
 * @returns Promise<void>
 */
async function sendEmailAsync(email, dependencies = { sendEmailJobRepository }) {
  if (!email || !(email instanceof Email)) {
    throw new Error('An instance of Email is required.');
  }

  return dependencies.sendEmailJobRepository.performAsync(email.payload);
}

export { sendEmail, sendEmailAsync };
