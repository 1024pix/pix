import { JobRepository } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { ImportOrganizationLearnersJob } from '../../../domain/models/ImportOrganizationLearnersJob.js';

class ImportOrganizationLearnersJobRepository extends JobRepository {
  constructor() {
    super({
      name: ImportOrganizationLearnersJob.name,
      expireIn: '00:30:00',
      retryLimit: 0,
      retryDelay: 0,
      retryBackoff: false,
    });
  }
}

export const importOrganizationLearnersJobRepository = new ImportOrganizationLearnersJobRepository();
