import { JobPgBoss } from '../../../../../shared/infrastructure/jobs/JobPgBoss.js';
import { CertificationRescoringByScriptJob } from '../../../domain/models/CertificationRescoringByScriptJob.js';

class CertificationRescoringByScriptJobRepository extends JobPgBoss {
  constructor() {
    super({
      name: CertificationRescoringByScriptJob.name,
    });
  }
}

export const certificationRescoringByScriptJobRepository = new CertificationRescoringByScriptJobRepository();
