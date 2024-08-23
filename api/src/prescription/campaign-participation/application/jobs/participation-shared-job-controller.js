import { usecases } from '../../../../../lib/domain/usecases/index.js';
import { JobController } from '../../../../shared/application/jobs/job-controller.js';
import { ParticipationSharedJob } from '../../domain/models/ParticipationSharedJob.js';

export class ParticipationSharedJobController extends JobController {
  constructor() {
    super(ParticipationSharedJob.name);
  }

  async handle({ data }) {
    const { campaignParticipationId } = data;

    await usecases.sendSharedParticipationResultsToPoleEmploi({ campaignParticipationId });
  }
}
