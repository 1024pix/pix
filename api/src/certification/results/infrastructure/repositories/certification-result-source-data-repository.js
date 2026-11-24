import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks } from '../../../shared/domain/models/Frameworks.js';

export async function findBySessionId(sessionId) {
  const knexConn = DomainTransaction.getConnection();
  const certificationData = await knexConn
    .select({
      certificationCourseId: 'certification-courses.id',
      userId: 'certification-courses.userId',
      sessionId: 'certification-courses.sessionId',
      organizationLearnerId: 'certification-candidates.organizationLearnerId',
      algorithmEngineVersion: 'certification-courses.version',
      firstName: 'certification-courses.firstName',
      lastName: 'certification-courses.lastName',
      externalId: 'certification-courses.externalId',
      birthdate: 'certification-courses.birthdate',
      birthplace: 'certification-courses.birthplace',
      birthPostalCode: 'certification-courses.birthPostalCode',
      birthINSEECode: 'certification-courses.birthINSEECode',
      birthCountry: 'certification-courses.birthCountry',
      verificationCode: 'certification-courses.verificationCode',
      certificationCenter: 'sessions.certificationCenter',
      startedAt: 'certification-courses.createdAt',
      deliveredAt: 'sessions.publishedAt',
      status: 'assessment-results.status',
      framework: 'certification-courses.framework',
      maxReachableLevel: 'certification_versions.maxReachableLevel',
      pixScore: 'assessment-results.pixScore',
      reachedMeshIndex: 'assessment-results.reachedMeshIndex',
      v3EduExternalJuryResult: 'assessment-results.eduV3ExternalJuryResult',
      commentByAutoJury: 'assessment-results.commentByAutoJury',
      commentByJury: 'assessment-results.commentByJury',
      commentForCandidate: 'assessment-results.commentForCandidate',
      commentForOrganization: 'assessment-results.commentForOrganization',
      competenceMarks: knexConn.raw(`
        json_agg(
          json_build_object('level', "competence-marks".level, 'competenceId', "competence-marks"."competenceId")
          ORDER BY "competence-marks"."competenceId" asc
        )`),
    })
    .where('sessions.id', sessionId)
    .where('certification-courses.isPublished', true)
    .from('certification-courses')
    .leftJoin('certification_versions', 'certification_versions.id', 'certification-courses.versionId')
    .leftJoin('certification-candidates', 'certification-candidates.id', 'certification-courses.candidateId')
    .join('sessions', 'sessions.id', 'certification-courses.sessionId')
    .join(
      'certification-courses-last-assessment-results',
      'certification-courses.id',
      'certification-courses-last-assessment-results.certificationCourseId',
    )
    .join(
      'assessment-results',
      'assessment-results.id',
      'certification-courses-last-assessment-results.lastAssessmentResultId',
    )
    .leftJoin('competence-marks', 'competence-marks.assessmentResultId', 'assessment-results.id')
    .groupBy(
      'certification-courses.id',
      'sessions.id',
      'assessment-results.id',
      'certification-candidates.id',
      'certification_versions.id',
    )
    .orderBy('certification-courses.id');
  if (certificationData.length === 0) {
    return {
      certificationData: [],
      learnerData: [],
      cleaData: [],
      pixPlusV2VoletPixData: [],
      pixPlusV2VoletExterneData: [],
    };
  }

  const organizationLearnerIds = certificationData
    .map(({ organizationLearnerId }) => organizationLearnerId)
    .filter(Boolean);

  let learnerData = [];
  if (organizationLearnerIds.length > 0) {
    learnerData = await knexConn
      .select({
        organizationLearnerId: 'id',
        middleName: 'middleName',
        thirdName: 'thirdName',
        nationalStudentId: 'nationalStudentId',
      })
      .from('organization-learners')
      .whereIn('id', organizationLearnerIds)
      .orderBy('id');
  }

  let cleaData = [];
  const cleaIds = certificationData
    .filter(({ framework }) => framework === Frameworks.CLEA)
    .map(({ certificationCourseId }) => certificationCourseId);
  if (cleaIds.length > 0) {
    cleaData = await knexConn
      .select({
        certificationCourseId: 'complementary-certification-courses.certificationCourseId',
        hasAcquiredClea: 'complementary-certification-course-results.acquired',
        cleaBadgeId: 'complementary-certification-course-results.complementaryCertificationBadgeId',
      })
      .from('complementary-certification-course-results')
      .innerJoin(
        'complementary-certification-courses',
        'complementary-certification-courses.id',
        'complementary-certification-course-results.complementaryCertificationCourseId',
      )
      .whereIn('complementary-certification-courses.certificationCourseId', cleaIds)
      .orderBy('complementary-certification-courses.certificationCourseId');
  }

  let pixPlusV2VoletExterneData = [];
  let pixPlusV2VoletPixData = [];
  const pixPlusV2Ids = certificationData
    .filter(
      ({ framework, algorithmEngineVersion }) =>
        [
          Frameworks.EDU_1ER_DEGRE,
          Frameworks.EDU_CPE,
          Frameworks.EDU_2ND_DEGRE,
          Frameworks.PRO_SANTE,
          Frameworks.DROIT,
        ].includes(framework) && algorithmEngineVersion === AlgorithmEngineVersion.V2,
    )
    .map(({ certificationCourseId }) => certificationCourseId);
  if (pixPlusV2Ids.length > 0) {
    pixPlusV2VoletPixData = await knexConn
      .select({
        certificationCourseId: 'complementary-certification-courses.certificationCourseId',
        v2ComplementaryVoletPixBadgeId: 'complementary-certification-course-results.complementaryCertificationBadgeId',
        v2ComplementaryVoletPixAcquired: 'complementary-certification-course-results.acquired',
      })
      .from('complementary-certification-course-results')
      .innerJoin(
        'complementary-certification-courses',
        'complementary-certification-courses.id',
        'complementary-certification-course-results.complementaryCertificationCourseId',
      )
      .whereIn('complementary-certification-courses.certificationCourseId', pixPlusV2Ids)
      .where('complementary-certification-course-results.source', 'PIX')
      .orderBy('complementary-certification-courses.certificationCourseId');
    pixPlusV2VoletExterneData = await knexConn
      .select({
        certificationCourseId: 'complementary-certification-courses.certificationCourseId',
        v2EduVoletExterneBadgeId: 'complementary-certification-course-results.complementaryCertificationBadgeId',
        v2EduVoletExterneAcquired: 'complementary-certification-course-results.acquired',
      })
      .from('complementary-certification-course-results')
      .innerJoin(
        'complementary-certification-courses',
        'complementary-certification-courses.id',
        'complementary-certification-course-results.complementaryCertificationCourseId',
      )
      .whereIn('complementary-certification-courses.certificationCourseId', pixPlusV2Ids)
      .where('complementary-certification-course-results.source', 'EXTERNAL')
      .orderBy('complementary-certification-courses.certificationCourseId');
  }

  for (const certificationItem of certificationData) {
    if (certificationItem.competenceMarks[0].competenceId === null) {
      certificationItem.competenceMarks = [];
    }
  }
  return {
    certificationData,
    learnerData,
    cleaData,
    pixPlusV2VoletPixData,
    pixPlusV2VoletExterneData,
  };
}
