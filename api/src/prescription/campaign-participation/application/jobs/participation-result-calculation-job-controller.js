import { usecases } from '../../../../../lib/domain/usecases/index.js';
import { JobController } from '../../../../shared/application/jobs/job-controller.js';
import { ParticipationResultCalculationJob } from '../../domain/models/ParticipationResultCalculationJob.js';

export class ParticipationResultCalculationJobController extends JobController {
  constructor() {
    super(ParticipationResultCalculationJob.name);
  }

  async handle(scheduleParticipationResultCalculation) {
    const { campaignParticipationId } = scheduleParticipationResultCalculation;

    await usecases.saveComputedCampaignParticipationResult({ campaignParticipationId });
  }
}
