import { JobController, JobTeam } from '../../../application/jobs/job-controller.js';
import { Email } from '../../domain/models/Email.js';
import * as emailRepository from '../../infrastructure/repositories/email.repository.js';

export class SendEmailJobController extends JobController {
  constructor() {
    super('SendEmailJob', {
      description: "Envoie un email via le fournisseur configuré. Tous les emails de l'API transitent par cette file.",
      team: JobTeam.STAFF,
    });
  }

  async handle({ data, dependencies = { emailRepository } }) {
    const email = new Email(data);
    await dependencies.emailRepository.sendEmail(email);
  }
}
