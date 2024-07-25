import { JobPgBoss } from '../../../../shared/infrastructure/jobs/JobPgBoss.js';

class ValidateOrganizationImportFileJob extends JobPgBoss {
  constructor(queryBuilder) {
    super({ name: 'ValidateOrganizationImportFileJob', expireIn: '00:30:00' }, queryBuilder);
  }
}

export { ValidateOrganizationImportFileJob };
