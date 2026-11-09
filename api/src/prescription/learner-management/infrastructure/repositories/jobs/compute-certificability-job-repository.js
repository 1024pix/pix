import { JobExpireIn } from '../../../../../shared/infrastructure/jobs/default-config.js';
import { JobRepository } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { ComputeCertificabilityJob } from '../../../domain/models/jobs/ComputeCertificabilityJob.js';

class ComputeCertificabilityJobRepository extends JobRepository {
  constructor() {
    super({
      name: ComputeCertificabilityJob.name,
      expireIn: JobExpireIn.THREE_HOURS,
    });
  }
}

export const computeCertificabilityJobRepository = new ComputeCertificabilityJobRepository();
