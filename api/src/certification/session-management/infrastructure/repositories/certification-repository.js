import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { batchUpdate } from '../../../../shared/infrastructure/utils/knex-utils.js';

export async function getStatusesBySessionId(sessionId) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('certification-courses')
    .select({
      certificationCourseId: 'certification-courses.id',
      userId: 'certification-courses.userId',
      pixCertificationStatus: 'assessment-results.status',
    })
    .where('certification-courses.sessionId', sessionId)
    .join('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
    .leftJoin(
      'certification-courses-last-assessment-results',
      'certification-courses.id',
      'certification-courses-last-assessment-results.certificationCourseId',
    )
    .leftJoin(
      'assessment-results',
      'assessment-results.id',
      'certification-courses-last-assessment-results.lastAssessmentResultId',
    );
}

export async function publishCertificationCourses({ certificationCourseIds, publishedAt }) {
  await batchUpdate({
    tableName: 'certification-courses',
    primaryKeyName: 'id',
    rows: certificationCourseIds.map(({ certificationCourseId }) => ({
      id: certificationCourseId,
      isPublished: true,
      updatedAt: publishedAt,
    })),
  });
}

export async function unpublishCertificationCoursesBySessionId({ sessionId }) {
  const knexConn = DomainTransaction.getConnection();
  await knexConn('certification-courses').where({ sessionId }).update({ isPublished: false, updatedAt: new Date() });
}
