import { JobPgBoss } from '../../../../../lib/infrastructure/jobs/JobPgBoss.js';

class ImportOrganizationLearnersJob extends JobPgBoss {
  constructor(queryBuilder) {
    super({ name: 'ImportOrganizationLearnersJob', expireIn: '00:30:00' }, queryBuilder);
  }
}

export { ImportOrganizationLearnersJob };
