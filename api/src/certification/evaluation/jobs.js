import { CertificationCompletedJobController } from './application/jobs/certification-completed-job-controller.js';
import { ScoreCertificationJobController } from './application/jobs/score-certification-job-controller.js';

export const certificationEvaluationJobControllers = [
  CertificationCompletedJobController,
  ScoreCertificationJobController,
];
