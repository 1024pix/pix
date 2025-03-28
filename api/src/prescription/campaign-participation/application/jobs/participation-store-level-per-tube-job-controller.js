import { JobController } from '../../../../shared/application/jobs/job-controller.js';
import { ParticipationStoreLevelPerTubeJob } from '../../domain/models/ParticipationStoreLevelPerTubeJob.js';
import { usecases } from '../../domain/usecases/index.js';

export class ParticipationSharedJobController extends JobController {
  constructor() {
    super(ParticipationStoreLevelPerTubeJob.name);
  }

  async handle({ data }) {
    const { campaignParticipationId } = data;

    await usecases.storeCampaignParticipationLevelPerTube({ campaignParticipationId });
  }
}
