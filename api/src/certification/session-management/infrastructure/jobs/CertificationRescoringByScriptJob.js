import CertificationRescoredByScript from '../../../../../lib/domain/events/CertificationRescoredByScript.js';
import { JobPgBoss } from '../../../../shared/infrastructure/jobs/JobPgBoss.js';

export class CertificationRescoringByScriptJob extends JobPgBoss {
  constructor(queryBuilder) {
    super(
      {
        name: 'CertificationRescoringByScriptJob',
      },
      queryBuilder,
    );
  }

  /**
   * @param {number} certificationCourseId
   */
  async schedule(certificationCourseId) {
    const data = new CertificationRescoredByScript({ certificationCourseId });
    return super.schedule(data);
  }
}
