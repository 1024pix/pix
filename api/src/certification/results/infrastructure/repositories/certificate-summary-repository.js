import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { Frameworks } from '../../../configuration/domain/models/Frameworks.js';
import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';
import { CertificateSummary } from '../../domain/models/CertificateSummary.js';

/**
 * @param {number} userId
 * @returns {Promise<CertificateSummary[]>}
 */
export async function findByUserId({ userId }) {
  const knexConn = DomainTransaction.getConnection();

  const certificationDatas = await knexConn('certification-courses')
    .select({
      id: 'certification-courses.id',
      algorithmVersion: 'certification-courses.version',
      verificationCode: 'certification-courses.verificationCode',
      certificationStartedAt: 'certification-courses.createdAt',
      isPublished: 'certification-courses.isPublished',
      certificationVersion: 'certification-courses.version',
      certificationFramework: 'certification-courses.framework',
      certificationCenterName: 'sessions.certificationCenter',
      pixScore: 'assessment-results.pixScore',
      commentForCandidate: 'assessment-results.commentForCandidate',
      commentByAutoJury: 'assessment-results.commentByAutoJury',
      assessmentResultStatus: 'assessment-results.status',
      reachedMeshIndex: 'assessment-results.reachedMeshIndex',
    })
    .join('sessions', 'sessions.id', 'certification-courses.sessionId')
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
    .where('certification-courses.userId', userId)
    .orderBy('certification-courses.id', 'ASC');

  const certificateSummaries = [];

  for (const certificationData of certificationDatas) {
    const isDoubleCertification = AlgorithmEngineVersion.isV3(certificationData.certificationVersion)
      ? certificationData.certificationFramework === Frameworks.CLEA
      : certificationData.certificationFramework !== Frameworks.CORE;

    let isExtraCertificationAcquired = null;
    if (isDoubleCertification) {
      const extraCertificationResult = await _getExtraCertificationResult(certificationData.id, knexConn);
      isExtraCertificationAcquired = extraCertificationResult.isExtraCertificationAcquired;
    }

    certificateSummaries.push(
      CertificateSummary.buildFrom({
        ...certificationData,
        isExtraCertificationAcquired,
      }),
    );
  }

  return certificateSummaries;
}

function _getExtraCertificationResult(certificationId, knexConn) {
  return knexConn('complementary-certification-courses')
    .select({
      certificationCourseId: 'complementary-certification-courses.certificationCourseId',
      isExtraCertificationAcquired: knexConn.raw(`
          bool_and("complementary-certification-course-results"."acquired")
        `),
    })
    .join(
      'complementary-certification-course-results',
      'complementary-certification-courses.id',
      'complementary-certification-course-results.complementaryCertificationCourseId',
    )
    .where('complementary-certification-courses.certificationCourseId', certificationId)
    .groupBy('complementary-certification-courses.certificationCourseId')
    .orderBy('complementary-certification-courses.certificationCourseId', 'ASC')
    .first();
}
