import { JobPgBoss } from '../../../../../lib/infrastructure/jobs/JobPgBoss.js';

export class CertificationRescoringByScriptJob extends JobPgBoss {
  constructor(queryBuilder) {
    super(
      {
        name: 'CertificationRescoringByScriptJob',
      },
      queryBuilder,
    );
  }

  /** * @param {number} certificationCourseId */
  async schedule(certificationCourseId) {
    return super.schedule({ certificationCourseId, type: 'CertificationRescoringByScript' });
  }
}
