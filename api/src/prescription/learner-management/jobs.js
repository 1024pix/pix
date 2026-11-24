import { AnonymizeLearnersAndCampaignParticipationsEventHandler } from './application/jobs/anonymize-learners-and-campaign-participations-event-handler.js';
import { ComputeCertificabilityJobController } from './application/jobs/compute-certificability-job-controller.js';
import { ImportFromFregataJobController } from './application/jobs/import-learners/import-from-fregata-job-controller.js';
import { ImportFromGenericJobController } from './application/jobs/import-learners/import-from-generic-job-controller.js';
import { ImportFromSiecleJobController } from './application/jobs/import-learners/import-from-siecle-job-controller.js';
import { ImportFromSupJobController } from './application/jobs/import-learners/import-from-sup-job-controller.js';
import { ScheduleComputeOrganizationLearnersCertificabilityJobController } from './application/jobs/schedule-compute-organization-learners-certificability-job-controller.js';
import { ValidateFregataFileJobController } from './application/jobs/validate-learners-file/validate-fregata-file-job-controller.js';
import { ValidateGenericFileJobController } from './application/jobs/validate-learners-file/validate-generic-file-job-controller.js';
import { ValidateSiecleFileJobController } from './application/jobs/validate-learners-file/validate-siecle-file-job-controller.js';
import { ValidateSupFileJobController } from './application/jobs/validate-learners-file/validate-sup-file-job-controller.js';

export const learnerManagementJobControllers = [
  AnonymizeLearnersAndCampaignParticipationsEventHandler,
  ComputeCertificabilityJobController,
  ImportFromFregataJobController,
  ImportFromGenericJobController,
  ImportFromSiecleJobController,
  ImportFromSupJobController,
  ScheduleComputeOrganizationLearnersCertificabilityJobController,
  ValidateFregataFileJobController,
  ValidateGenericFileJobController,
  ValidateSiecleFileJobController,
  ValidateSupFileJobController,
];
