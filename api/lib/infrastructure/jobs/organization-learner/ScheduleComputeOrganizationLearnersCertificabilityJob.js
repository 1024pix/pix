import { JobPgBoss } from '../JobPgBoss.js';

class ScheduleComputeOrganizationLearnersCertificabilityJob extends JobPgBoss {
  constructor(queryBuilder) {
    super(
      { name: 'ScheduleComputeOrganizationLearnersCertificabilityJob', retryLimit: 0, expireIn: '01:00:00' },
      queryBuilder,
    );
  }
}

export { ScheduleComputeOrganizationLearnersCertificabilityJob };
