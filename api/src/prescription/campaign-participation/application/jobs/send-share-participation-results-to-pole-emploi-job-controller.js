import { usecases } from '../../../../../lib/domain/usecases/index.js';

export class SendSharedParticipationResultsToPoleEmploiJobController {
  async handle(sendSharedParticipationResultsToPoleEmploiJob) {
    const { campaignParticipationId } = sendSharedParticipationResultsToPoleEmploiJob;

    await usecases.sendSharedParticipationResultsToPoleEmploi({ campaignParticipationId });
  }
}
