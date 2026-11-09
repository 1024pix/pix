import { config } from '../../../../../config/config.js';
import { JobController } from '../../../../shared/application/jobs/job-controller.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { ComputeCertificabilityJob } from '../../domain/models/jobs/ComputeCertificabilityJob.js';
import { usecases } from '../../domain/usecases/index.js';

export class ComputeCertificabilityJobController extends JobController {
  constructor() {
    super(ComputeCertificabilityJob.name);
  }

  get isJobEnabled() {
    return config.pgBoss.computeCertificabilityJobEnabled;
  }

  async handle({ data }) {
    const { organizationLearnerIds } = data;

    for (const organizationLearnerId of organizationLearnerIds) {
      try {
        await usecases.computeOrganizationLearnerCertificability({ organizationLearnerId });
      } catch (err) {
        logger.error(
          { err, organizationLearnerId },
          `An error occured in ComputeCertificabilityJobController when computing certificability for learner ${organizationLearnerId}`,
        );
      }
    }
  }
}
