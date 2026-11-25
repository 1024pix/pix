import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';
import { ComplementaryCertificationCourseResult } from '../../../shared/domain/models/ComplementaryCertificationCourseResult.js';
import { Frameworks } from '../../../shared/domain/models/Frameworks.js';

const PIX_PLUS_V2_FRAMEWORKS = [
  Frameworks.EDU_1ER_DEGRE,
  Frameworks.EDU_CPE,
  Frameworks.EDU_2ND_DEGRE,
  Frameworks.PRO_SANTE,
  Frameworks.DROIT,
];

export async function findBySessionId(sessionId) {
  return findSourceData((queryBuilder) => queryBuilder.where('sessions.id', sessionId));
}

export async function findByCertificationCourseIds(certificationCourseIds) {
  if (certificationCourseIds.length === 0) {
    return emptySourceData();
  }
  return findSourceData((queryBuilder) => queryBuilder.whereIn('certification-courses.id', certificationCourseIds));
}

async function findSourceData(applyFilter) {
  const certificationData = await findCertificationData(applyFilter);
  if (certificationData.length === 0) {
    return emptySourceData();
  }

  const organizationLearnerIds = certificationData
    .map(({ organizationLearnerId }) => organizationLearnerId)
    .filter(Boolean);
  const cleaIds = certificationData
    .filter(({ framework }) => framework === Frameworks.CLEA)
    .map(({ certificationCourseId }) => certificationCourseId);
  const pixPlusV2Ids = certificationData
    .filter(
      ({ framework, algorithmEngineVersion }) =>
        PIX_PLUS_V2_FRAMEWORKS.includes(framework) && algorithmEngineVersion === AlgorithmEngineVersion.V2,
    )
    .map(({ certificationCourseId }) => certificationCourseId);

  const learnerData = await findLearnerData(organizationLearnerIds);
  const cleaData = await findComplementaryResults({
    certificationCourseIds: cleaIds,
    badgeIdAlias: 'cleaBadgeId',
    acquiredAlias: 'hasAcquiredClea',
  });
  const pixPlusV2VoletPixData = await findComplementaryResults({
    certificationCourseIds: pixPlusV2Ids,
    badgeIdAlias: 'v2ComplementaryVoletPixBadgeId',
    acquiredAlias: 'v2ComplementaryVoletPixAcquired',
    source: ComplementaryCertificationCourseResult.sources.PIX,
  });
  const pixPlusV2VoletExterneData = await findComplementaryResults({
    certificationCourseIds: pixPlusV2Ids,
    badgeIdAlias: 'v2EduVoletExterneBadgeId',
    acquiredAlias: 'v2EduVoletExterneAcquired',
    source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
  });

  return {
    certificationData,
    learnerData,
    cleaData,
    pixPlusV2VoletPixData,
    pixPlusV2VoletExterneData,
  };
}

function emptySourceData() {
  return {
    certificationData: [],
    learnerData: [],
    cleaData: [],
    pixPlusV2VoletPixData: [],
    pixPlusV2VoletExterneData: [],
  };
}

async function findCertificationData(applyFilter) {
  const knexConn = DomainTransaction.getConnection();
  const query = knexConn
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
  applyFilter(query);
  const certificationData = await query;

  for (const certificationItem of certificationData) {
    if (certificationItem.competenceMarks[0].competenceId === null) {
      certificationItem.competenceMarks = [];
    }
  }
  return certificationData;
}

async function findLearnerData(organizationLearnerIds) {
  if (organizationLearnerIds.length === 0) {
    return [];
  }
  const knexConn = DomainTransaction.getConnection();
  return knexConn
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

async function findComplementaryResults({ certificationCourseIds, badgeIdAlias, acquiredAlias, source }) {
  if (certificationCourseIds.length === 0) {
    return [];
  }
  const knexConn = DomainTransaction.getConnection();
  const query = knexConn
    .select({
      certificationCourseId: 'complementary-certification-courses.certificationCourseId',
      [badgeIdAlias]: 'complementary-certification-course-results.complementaryCertificationBadgeId',
      [acquiredAlias]: 'complementary-certification-course-results.acquired',
    })
    .from('complementary-certification-course-results')
    .innerJoin(
      'complementary-certification-courses',
      'complementary-certification-courses.id',
      'complementary-certification-course-results.complementaryCertificationCourseId',
    )
    .whereIn('complementary-certification-courses.certificationCourseId', certificationCourseIds)
    .orderBy('complementary-certification-courses.certificationCourseId');
  if (source) {
    query.where('complementary-certification-course-results.source', source);
  }
  return query;
}
