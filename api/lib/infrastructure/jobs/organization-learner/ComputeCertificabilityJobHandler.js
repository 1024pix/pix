import { ComputeCertificabilityJob } from './ComputeCertificabilityJob.js';
import { usecases } from '../../../domain/usecases/index.js';

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
