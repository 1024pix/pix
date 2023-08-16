import { JobPgBoss } from '../JobPgBoss.js';

class ScheduleComputeOrganizationLearnersCertificabilityJob extends JobPgBoss {
  constructor(queryBuilder) {
    super({ name: 'ScheduleComputeOrganizationLearnersCertificabilityJob', retryLimit: 0 }, queryBuilder);
  }
}

export { ScheduleComputeOrganizationLearnersCertificabilityJob };
