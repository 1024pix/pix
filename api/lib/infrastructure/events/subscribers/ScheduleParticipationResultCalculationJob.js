import { CampaignParticipationResultsShared } from '../../../domain/events/CampaignParticipationResultsShared.js';

class ScheduleParticipationResultCalculationJob {
  constructor({ participationResultCalculationJob }) {
    this.participationResultCalculationJob = participationResultCalculationJob;
  }

  async handle(event) {
    await this.participationResultCalculationJob.schedule(event);
  }

  get name() {
    return 'ScheduleParticipationResultCalculation';
  }
}

ScheduleParticipationResultCalculationJob.event = CampaignParticipationResultsShared;

export { ScheduleParticipationResultCalculationJob };
