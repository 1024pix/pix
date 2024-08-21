import { JobRepository } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { CertificationRescoringByScriptJob } from '../../../domain/models/CertificationRescoringByScriptJob.js';

class CertificationRescoringByScriptJobRepository extends JobRepository {
  constructor() {
    super({
      name: CertificationRescoringByScriptJob.name,
    });
  }
}

export const certificationRescoringByScriptJobRepository = new CertificationRescoringByScriptJobRepository();
