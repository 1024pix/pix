import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CertificationCourseInfo } from '../../domain/read-models/CertificationCourseInfo.js';

export async function find(id) {
  const data = await baseQuery().where('certification-courses.id', id).first();

  if (!data) {
    return null;
  }

  return new CertificationCourseInfo(data);
}

export async function findByUserIdAndSessionId({ sessionId, userId }) {
  const data = await baseQuery()
    .where('certification-courses.userId', userId)
    .where('certification-courses.sessionId', sessionId)
    .first();

  if (!data) {
    return null;
  }

  return new CertificationCourseInfo(data);
}

function baseQuery() {
  const knexConn = DomainTransaction.getConnection();
  return knexConn
    .select({
      id: 'certification-courses.id',
      firstName: 'certification-courses.firstName',
      lastName: 'certification-courses.lastName',
      version: 'certification-courses.version',
      isAdjustedForAccessibility: 'certification-candidates.accessibilityAdjustmentNeeded',
      assessmentId: 'assessments.id',
      candidateId: 'certification-courses.candidateId',
      nbChallenges: knexConn.raw('certification_versions."challengesConfiguration"->\'maximumAssessmentLength\''),
    })
    .from('certification-courses')
    .join('certification-candidates', 'certification-candidates.id', 'certification-courses.candidateId')
    .join('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
    .join('certification_versions', 'certification_versions.id', 'certification-courses.versionId');
}
