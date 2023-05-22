import { ParticipationResultCalculationJob } from './ParticipationResultCalculationJob.js';
import { usecases } from '../../../domain/usecases/index.js';

class ParticipationResultCalculationJobHandler {
  async handle(event) {
    const { campaignParticipationId } = event;

    await usecases.saveComputedCampaignParticipationResult({ campaignParticipationId });
  }

  get name() {
    return ParticipationResultCalculationJob.name;
  }
}

export { ParticipationResultCalculationJobHandler };
