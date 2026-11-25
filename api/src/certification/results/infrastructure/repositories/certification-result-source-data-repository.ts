import type { Knex } from 'knex';

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';
import { ComplementaryCertificationCourseResult } from '../../../shared/domain/models/ComplementaryCertificationCourseResult.js';
import { Frameworks } from '../../../shared/domain/models/Frameworks.js';
import type { Framework } from '../../../shared/domain/types.ts';
import type {
  CertificationDataProps,
  CertificationResultSourceData,
  CleaDataProps,
  LearnerDataProps,
  PixPlusV2VoletExterneDataProps,
  PixPlusV2VoletPixDataProps,
} from '../../domain/models/factories/CertificationResultSourceData.ts';

type QueryFilter = (queryBuilder: Knex.QueryBuilder) => Knex.QueryBuilder;

const PIX_PLUS_V2_FRAMEWORKS: Framework[] = [
  Frameworks.EDU_1ER_DEGRE,
  Frameworks.EDU_CPE,
  Frameworks.EDU_2ND_DEGRE,
  Frameworks.PRO_SANTE,
  Frameworks.DROIT,
];

export async function findBySessionId(sessionId: number): Promise<CertificationResultSourceData> {
  return findSourceData((queryBuilder) => queryBuilder.where('sessions.id', sessionId));
}

export async function findByCertificationCourseIds(
  certificationCourseIds: number[],
): Promise<CertificationResultSourceData> {
  if (certificationCourseIds.length === 0) {
    return emptySourceData();
  }
  return findSourceData((queryBuilder) => queryBuilder.whereIn('certification-courses.id', certificationCourseIds));
}

async function findSourceData(applyFilter: QueryFilter): Promise<CertificationResultSourceData> {
  const certificationData = await findCertificationData(applyFilter);
  if (certificationData.length === 0) {
    return emptySourceData();
  }

  const organizationLearnerIds = certificationData
    .map(({ organizationLearnerId }) => organizationLearnerId)
    .filter((organizationLearnerId) => organizationLearnerId !== null);
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
  const cleaData = await findComplementaryResults<CleaDataProps>({
    certificationCourseIds: cleaIds,
    badgeIdAlias: 'cleaBadgeId',
    acquiredAlias: 'hasAcquiredClea',
  });
  const pixPlusV2VoletPixData = await findComplementaryResults<PixPlusV2VoletPixDataProps>({
    certificationCourseIds: pixPlusV2Ids,
    badgeIdAlias: 'v2ComplementaryVoletPixBadgeId',
    acquiredAlias: 'v2ComplementaryVoletPixAcquired',
    source: ComplementaryCertificationCourseResult.sources.PIX,
  });
  const pixPlusV2VoletExterneData = await findComplementaryResults<PixPlusV2VoletExterneDataProps>({
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

function emptySourceData(): CertificationResultSourceData {
  return {
    certificationData: [],
    learnerData: [],
    cleaData: [],
    pixPlusV2VoletPixData: [],
    pixPlusV2VoletExterneData: [],
  };
}

async function findCertificationData(applyFilter: QueryFilter): Promise<CertificationDataProps[]> {
  const knexConn = DomainTransaction.getConnection();
  const query = knexConn
    .select({
      certificationCourseId: 'certification-courses.id',
      userId: knexConn.raw(`
        CASE WHEN "users"."hasBeenAnonymised" THEN NULL ELSE "certification-courses"."userId" END`),
      sessionId: 'certification-courses.sessionId',
      organizationLearnerId: knexConn.raw(`
        CASE WHEN "organization-learners"."deletedAt" IS NOT NULL THEN NULL ELSE "organization-learners"."id" END`),
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
    .leftJoin('organization-learners', 'organization-learners.id', 'certification-candidates.organizationLearnerId')
    .leftJoin('users', 'users.id', 'certification-courses.userId')
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
      'organization-learners.id',
      'users.id',
    )
    .orderBy('certification-courses.id');
  applyFilter(query);
  const certificationData = (await query) as CertificationDataProps[];

  for (const certificationItem of certificationData) {
    if (certificationItem.competenceMarks[0].competenceId === null) {
      certificationItem.competenceMarks = [];
    }
  }
  return certificationData;
}

async function findLearnerData(organizationLearnerIds: number[]): Promise<LearnerDataProps[]> {
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

async function findComplementaryResults<T>({
  certificationCourseIds,
  badgeIdAlias,
  acquiredAlias,
  source,
}: {
  certificationCourseIds: number[];
  badgeIdAlias: string;
  acquiredAlias: string;
  source?: string;
}): Promise<T[]> {
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
