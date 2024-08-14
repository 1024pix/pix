import { DomainTransaction } from '../../../../../shared/domain/DomainTransaction.js';
import { JobPgBoss } from '../../../../../shared/infrastructure/jobs/JobPgBoss.js';
import { ImportOrganizationLearnersJob } from '../../../domain/models/ImportOrganizationLearnersJob.js';

class ImportOrganizationLearnersJobRepository extends JobPgBoss {
  constructor() {
    super(
      { name: ImportOrganizationLearnersJob.name, expireIn: '00:30:00', retryLimit: 0, retryDelay: 0, retryBackoff: 0 },
      DomainTransaction.getConnection(),
    );
  }
}

export const importOrganizationLearnersJobRepository = new ImportOrganizationLearnersJobRepository();
