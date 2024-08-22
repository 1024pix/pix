import { JobRepository } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { ComputeCertificabilityJob } from '../../../domain/models/ComputeCertificabilityJob.js';

class ComputeCertificabilityJobRepository extends JobRepository {
  constructor() {
    super({
      name: ComputeCertificabilityJob.name,
    });
  }
}

export const computeCertificabilityJobRepository = new ComputeCertificabilityJobRepository();
