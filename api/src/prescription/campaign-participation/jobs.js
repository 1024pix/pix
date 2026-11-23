import { ParticipationResultCalculationJobController } from './application/jobs/participation-result-calculation-job-controller.js';
import { ParticipationSharedJobController } from './application/jobs/participation-shared-job-controller.js';
import { ParticipationStartedJobController } from './application/jobs/participation-started-job-controller.js';

export const campaignParticipationJobControllers = [
  ParticipationResultCalculationJobController,
  ParticipationSharedJobController,
  ParticipationStartedJobController,
];
