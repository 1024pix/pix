import Job from './SendSharedParticipationResultsToPoleEmploiJob';
import usecases from '../../../domain/usecases';

class SendSharedParticipationResultsToPoleEmploiHandler {
  async handle(event) {
    const { campaignParticipationId } = event;

    return usecases.sendSharedParticipationResultsToPoleEmploi({ campaignParticipationId });
  }

  get name() {
    return Job.name;
  }
}

export default SendSharedParticipationResultsToPoleEmploiHandler;
