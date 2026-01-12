import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { answerRepository } from '../../../../shared/infrastructure/repositories/answer-repository.js';
import { AssessmentSheet } from '../../domain/models/AssessmentSheet.js';

export async function findByCertificationCourseId(certificationCourseId) {
  const knexConn = DomainTransaction.getConnection();
  const data = await knexConn
    .select({
      certificationCourseId: 'certification-courses.id',
      assessmentId: 'assessments.id',
      abortReason: 'certification-courses.abortReason',
      maxReachableLevelOnCertificationDate: 'certification-courses.maxReachableLevelOnCertificationDate',
      isRejectedForFraud: 'certification-courses.isRejectedForFraud',
    })
    .from('certification-courses')
    .join('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
    .where('certification-courses.id', '=', certificationCourseId);

  const answers = await answerRepository.findByAssessment(data.assessmentId);

  return new AssessmentSheet({
    ...data,
    answers,
  });
}
