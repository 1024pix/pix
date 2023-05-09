import { Job } from './SendSharedParticipationResultsToPoleEmploiJob.js';
import { usecases } from '../../../domain/usecases/index.js';

class SendSharedParticipationResultsToPoleEmploiHandler {
  async handle(event) {
    const { campaignParticipationId } = event;

    return usecases.sendSharedParticipationResultsToPoleEmploi({ campaignParticipationId });
  }

  get name() {
    return Job.name;
  }
}

export { SendSharedParticipationResultsToPoleEmploiHandler };
