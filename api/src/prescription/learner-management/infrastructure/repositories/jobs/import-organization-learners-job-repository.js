import { JobExpireIn, JobRepository } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { ImportOrganizationLearnersJob } from '../../../domain/models/ImportOrganizationLearnersJob.js';

class ImportOrganizationLearnersJobRepository extends JobRepository {
  constructor() {
    super({
      name: ImportOrganizationLearnersJob.name,
      expireIn: JobExpireIn.HIGH,
    });
  }
}

export const importOrganizationLearnersJobRepository = new ImportOrganizationLearnersJobRepository();
