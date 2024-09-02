import { JobRepository } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { CpfExportBuilderJob } from '../../../domain/models/CpfExportBuilderJob.js';

class CpfExportBuilderJobRepository extends JobRepository {
  constructor() {
    super({
      name: CpfExportBuilderJob.name,
    });
  }
}

export const cpfExportBuilderJobRepository = new CpfExportBuilderJobRepository();
