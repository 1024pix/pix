import { usecases } from '../../../../../lib/domain/usecases/index.js';

export class ParticipationResultCalculationJobController {
  async handle(scheduleParticipationResultCalculation) {
    const { campaignParticipationId } = scheduleParticipationResultCalculation;

    await usecases.saveComputedCampaignParticipationResult({ campaignParticipationId });
  }
}
