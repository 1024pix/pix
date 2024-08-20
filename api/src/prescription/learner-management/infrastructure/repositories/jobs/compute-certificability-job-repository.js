import { JobPgBoss } from '../../../../../shared/infrastructure/jobs/JobPgBoss.js';
import { ComputeCertificabilityJob } from '../../../domain/models/ComputeCertificabilityJob.js';

class ComputeCertificabilityJobRepository extends JobPgBoss {
  constructor() {
    super({
      name: ComputeCertificabilityJob.name,
      retryLimit: 0,
      retryDelay: 0,
      retryBackoff: false,
    });
  }
}

export const computeCertificabilityJobRepository = new ComputeCertificabilityJobRepository();
