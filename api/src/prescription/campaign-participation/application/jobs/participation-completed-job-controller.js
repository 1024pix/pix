import { usecases } from '../../../../../lib/domain/usecases/index.js';
import { JobController } from '../../../../shared/application/jobs/job-controller.js';
import { ParticipationCompletedJob } from '../../domain/models/ParticipationCompletedJob.js';
export class ParticipationCompletedJobController extends JobController {
  constructor() {
    super(ParticipationCompletedJob.name);
  }

  get legacyName() {
    return 'PoleEmploiParticipationCompletedJob';
  }

  async handle({ data }) {
    const { campaignParticipationId } = data;

    await usecases.sendCompletedParticipationResultsToPoleEmploi({ campaignParticipationId });
  }
}
