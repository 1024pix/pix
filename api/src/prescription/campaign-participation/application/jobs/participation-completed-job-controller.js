import { JobController } from '../../../../shared/application/jobs/job-controller.js';
import { ParticipationCompletedJob } from '../../domain/models/ParticipationCompletedJob.js';
import { usecases } from '../../domain/usecases/index.js';
export class ParticipationCompletedJobController extends JobController {
  constructor() {
    super(ParticipationCompletedJob.name);
  }

  async handle({ data }) {
    const { campaignParticipationId } = data;

    await usecases.sendCompletedParticipationResultsToPoleEmploi({ campaignParticipationId });
  }
}
