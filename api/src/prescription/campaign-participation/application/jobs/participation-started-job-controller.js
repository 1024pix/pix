import { usecases } from '../../../../../lib/domain/usecases/index.js';
import { JobController } from '../../../../shared/application/jobs/job-controller.js';
import { ParticipationStartedJob } from '../../domain/models/ParticipationStartedJob.js';

export class ParticipationStartedJobController extends JobController {
  constructor() {
    super(ParticipationStartedJob.name);
  }

  get legacyName() {
    return 'PoleEmploiParticipationStartedJob';
  }

  async handle({ data }) {
    const { campaignParticipationId } = data;

    await usecases.sendSharedParticipationResultsToPoleEmploi({ campaignParticipationId });
  }
}
