import { usecases } from '../../../../../lib/domain/usecases/index.js';
import { ComputeCertificabilityJob } from './ComputeCertificabilityJob.js';

class ComputeCertificabilityJobHandler {
  async handle(event) {
    const { organizationLearnerId } = event;

    await usecases.computeOrganizationLearnerCertificability({ organizationLearnerId });
  }

  get name() {
    return ComputeCertificabilityJob.name;
  }
}

export { ComputeCertificabilityJobHandler };
