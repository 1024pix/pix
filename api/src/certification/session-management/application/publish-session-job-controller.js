import { JobController } from '../../../shared/application/jobs/job-controller.js';
import { PublishSessionJob } from '../domain/models/PublishSessionJob.js';
import { usecases } from '../domain/usecases/index.js';

export class PublishSessionJobController extends JobController {
  constructor() {
    super(PublishSessionJob.name);
  }

  async handle({ data, dependencies = { usecases } }) {
    await dependencies.usecases.publishSession(data);
  }
}
