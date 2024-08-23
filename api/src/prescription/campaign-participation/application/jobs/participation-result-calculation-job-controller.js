import { usecases } from '../../../../../lib/domain/usecases/index.js';
import { JobController } from '../../../../shared/application/jobs/job-controller.js';
import { ParticipationResultCalculationJob } from '../../domain/models/jobs/ParticipationResultCalculationJob.js';

export class ParticipationResultCalculationJobController extends JobController {
  constructor() {
    super(ParticipationResultCalculationJob.name);
  }

  async handle({ data }) {
    const { campaignParticipationId } = data;

    await usecases.saveComputedCampaignParticipationResult({ campaignParticipationId });
  }
}
