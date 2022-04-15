const Event = require('../../../domain/events/CampaignParticipationResultsShared');

class ScheduleParticipationResultCalculationJob {
  constructor({ participationResultCalculationJob }) {
    this.participationResultCalculationJob = participationResultCalculationJob;
  }

  async handle(event) {
    await this.participationResultCalculationJob.schedule(event);
  }
}

ScheduleParticipationResultCalculationJob.event = Event;

module.exports = ScheduleParticipationResultCalculationJob;
