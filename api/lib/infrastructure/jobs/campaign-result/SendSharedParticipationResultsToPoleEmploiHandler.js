const Job = require('./SendSharedParticipationResultsToPoleEmploiJob');
const usecases = require('../../../domain/usecases');

class SendSharedParticipationResultsToPoleEmploiHandler {
  async handle(event) {
    const { campaignParticipationId } = event;

    return usecases.sendSharedParticipationResultsToPoleEmploi({ campaignParticipationId });
  }

  get name() {
    return Job.name;
  }
}

module.exports = SendSharedParticipationResultsToPoleEmploiHandler;
