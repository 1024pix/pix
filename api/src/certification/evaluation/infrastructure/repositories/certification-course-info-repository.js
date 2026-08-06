import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CertificationCourseInfo } from '../../domain/read-models/CertificationCourseInfo.js';

export async function find(id) {
  const knexConn = DomainTransaction.getConnection();
  const data = await knexConn
    .select({
      id: 'certification-courses.id',
      firstName: 'certification-courses.firstName',
      lastName: 'certification-courses.lastName',
      version: 'certification-courses.version',
      isAdjustedForAccessibility: 'certification-candidates.accessibilityAdjustmentNeeded',
      assessmentId: 'assessments.id',
      nbChallenges: knexConn.raw('certification_versions."challengesConfiguration"->\'maximumAssessmentLength\''),
    })
    .from('certification-courses')
    .join('certification-candidates', 'certification-candidates.id', 'certification-courses.candidateId')
    .join('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
    .join('certification_versions', 'certification_versions.id', 'certification-courses.versionId')
    .where('certification-courses.id', id)
    .first();

  if (!data) {
    return null;
  }

  return new CertificationCourseInfo(data);
}
