const Job = require('./ParticipationResultCalculationJob.js');
const usecases = require('../../../domain/usecases/index.js');

class ParticipationResultCalculationJobHandler {
  async handle(event) {
    const { campaignParticipationId } = event;

    await usecases.saveComputedCampaignParticipationResult({ campaignParticipationId });
  }

  get name() {
    return Job.name;
  }
}

module.exports = ParticipationResultCalculationJobHandler;
