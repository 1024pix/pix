import { usecases } from '../../../../../lib/domain/usecases/index.js';
import { JobController } from '../../../../shared/application/jobs/job-controller.js';
import { ComputeCertificabilityJob } from '../../domain/models/ComputeCertificabilityJob.js';

class ComputeCertificabilityJobController extends JobController {
  constructor() {
    super(ComputeCertificabilityJob.name);
  }
  async handle({ data }) {
    const { organizationLearnerId } = data;

    await usecases.computeOrganizationLearnerCertificability({ organizationLearnerId });
  }
}

export { ComputeCertificabilityJobController };
