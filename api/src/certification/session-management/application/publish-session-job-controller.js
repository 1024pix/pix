import { JobController, JobTeam } from '../../../shared/application/jobs/job-controller.js';
import { PublishSessionJob } from '../domain/models/PublishSessionJob.js';
import { usecases } from '../domain/usecases/index.js';

export class PublishSessionJobController extends JobController {
  constructor() {
    super(PublishSessionJob.name, {
      description:
        "Publie une session de certification lors d'une publication en masse de sessions demandée depuis Pix Admin.",
      team: JobTeam.CERTIFICATION,
    });
  }

  async handle({ data, dependencies = { usecases } }) {
    // todo add correlation info with session id
    await dependencies.usecases.publishSession(data);
  }
}
