import { CreateLearningContentReleaseJobController } from './application/jobs/create-learning-content-release-job-controller.js';
import { RefreshLearningContentJobController } from './application/jobs/refresh-learning-content-job-controller.js';

export const learningContentJobControllers = [
  CreateLearningContentReleaseJobController,
  RefreshLearningContentJobController,
];
