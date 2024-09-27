import { knex } from '../../../../../db/knex-database-connection.js';
import { PixCertification } from '../../domain/models/PixCertification.js';

export async function findByUserId({ userId }) {
  const results = await knex('certification-courses')
    .select(
      'certification-courses.isRejectedForFraud',
      'certification-courses.isCancelled',
      'assessment-results.pixScore',
      'assessment-results.status',
    )
    .join(
      'certification-courses-last-assessment-results',
      'certification-courses-last-assessment-results.certificationCourseId',
      'certification-courses.id',
    )
    .join(
      'assessment-results',
      'assessment-results.id',
      'certification-courses-last-assessment-results.lastAssessmentResultId',
    )
    .where({ userId })
    .andWhere({ isPublished: true });

  return _toDomain(results);
}

function _toDomain(results) {
  return results.map((result) => new PixCertification(result));
}
