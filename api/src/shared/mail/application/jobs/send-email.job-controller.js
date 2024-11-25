import { JobController } from '../../../application/jobs/job-controller.js';
import { Email } from '../../domain/models/Email.js';
import * as emailRepository from '../../infrastructure/repositories/email.repository.js';

export class SendEmailJobController extends JobController {
  constructor() {
    super('SendEmailJob');
  }

  async handle({ data, dependencies = { emailRepository } }) {
    const email = new Email(data);
    await dependencies.emailRepository.sendEmail(email);
  }
}
