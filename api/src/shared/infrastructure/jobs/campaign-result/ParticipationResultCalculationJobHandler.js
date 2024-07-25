import { usecases } from '../../../../../lib/domain/usecases/index.js';
import { ParticipationResultCalculationJob } from './ParticipationResultCalculationJob.js';

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
