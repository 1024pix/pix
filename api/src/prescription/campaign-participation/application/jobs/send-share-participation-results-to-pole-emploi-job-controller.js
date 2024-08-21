import { usecases } from '../../../../../lib/domain/usecases/index.js';
import { JobController } from '../../../../shared/application/jobs/job-controller.js';
import { SendSharedParticipationResultsToPoleEmploiJob } from '../../domain/models/SendSharedParticipationResultsToPoleEmploiJob.js';

export class SendSharedParticipationResultsToPoleEmploiJobController extends JobController {
  constructor() {
    super(SendSharedParticipationResultsToPoleEmploiJob.name);
  }

  async handle(sendSharedParticipationResultsToPoleEmploiJob) {
    const { campaignParticipationId } = sendSharedParticipationResultsToPoleEmploiJob;

    await usecases.sendSharedParticipationResultsToPoleEmploi({ campaignParticipationId });
  }
}
