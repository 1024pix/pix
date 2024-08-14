import { usecases } from '../../../../../lib/domain/usecases/index.js';
import { ComputeCertificabilityJob } from '../../domain/models/ComputeCertificabilityJob.js';

class ComputeCertificabilityJobController {
  async handle(data) {
    const { organizationLearnerId } = data;

    await usecases.computeOrganizationLearnerCertificability({ organizationLearnerId });
  }

  get name() {
    return ComputeCertificabilityJob.name;
  }
}

export { ComputeCertificabilityJobController };
