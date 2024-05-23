import { usecases } from '../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import { SendSharedParticipationResultsToPoleEmploiJob } from './SendSharedParticipationResultsToPoleEmploiJob.js';

class SendSharedParticipationResultsToPoleEmploiHandler {
  async handle(event) {
    const { campaignParticipationId } = event;

    return usecases.sendSharedParticipationResultsToPoleEmploi({ campaignParticipationId });
  }

  get name() {
    return SendSharedParticipationResultsToPoleEmploiJob.name;
  }
}

export { SendSharedParticipationResultsToPoleEmploiHandler };
