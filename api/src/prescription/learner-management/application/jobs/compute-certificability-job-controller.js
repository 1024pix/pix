import { config } from '../../../../../config/config.js';
import { usecases } from '../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { JobController } from '../../../../shared/application/jobs/job-controller.js';
import { ComputeCertificabilityJob } from '../../domain/models/jobs/ComputeCertificabilityJob.js';

class ComputeCertificabilityJobController extends JobController {
  constructor() {
    super(ComputeCertificabilityJob.name);
  }

  get isJobEnabled() {
    return config.pgBoss.computeCertificabilityJobEnabled;
  }

  async handle({ data }) {
    const { organizationLearnerId } = data;

    await usecases.computeOrganizationLearnerCertificability({ organizationLearnerId });
  }
}

export { ComputeCertificabilityJobController };
