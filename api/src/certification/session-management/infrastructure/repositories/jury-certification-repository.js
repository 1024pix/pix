import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { CertificationIssueReport } from '../../../shared/domain/models/CertificationIssueReport.js';
import { JuryCertification } from '../../domain/models/JuryCertification.js';
import { ComplementaryCertificationCourseResultForJuryCertification } from '../../domain/read-models/ComplementaryCertificationCourseResultForJuryCertification.js';
import { ComplementaryCertificationCourseResultForJuryCertificationWithExternal } from '../../domain/read-models/ComplementaryCertificationCourseResultForJuryCertificationWithExternal.js';

export async function get({ certificationCourseId }) {
  const knexConn = DomainTransaction.getConnection();
  const juryCertificationDTO = await _selectJuryCertifications(knexConn)
    .where('certification-courses.id', certificationCourseId)
    .first();

  if (!juryCertificationDTO) {
    throw new NotFoundError(`Certification course of id ${certificationCourseId} does not exist.`);
  }

  const competenceMarkDTOs = await knexConn('competence-marks')
    .where({
      assessmentResultId: juryCertificationDTO.assessmentResultId,
    })
    .orderBy('competence_code', 'asc');

  const complementaryCertificationCourseResultDTOs = await knexConn('complementary-certification-course-results')
    .select(
      'complementary-certification-course-results.complementaryCertificationBadgeId',
      'complementary-certification-course-results.complementaryCertificationCourseId',
      'complementary-certification-course-results.acquired',
      'complementary-certification-course-results.source',
      'complementary-certification-courses.id',
      'complementary-certification-badges.label',
      'complementary-certification-badges.level',
      'complementary-certifications.hasExternalJury',
    )
    .leftJoin(
      'complementary-certification-courses',
      'complementary-certification-course-results.complementaryCertificationCourseId',
      'complementary-certification-courses.id',
    )
    .leftJoin(
      'complementary-certification-badges',
      'complementary-certification-badges.id',
      'complementary-certification-course-results.complementaryCertificationBadgeId',
    )
    .leftJoin('badges', 'complementary-certification-badges.badgeId', 'badges.id')
    .leftJoin(
      'complementary-certifications',
      'complementary-certifications.id',
      'complementary-certification-badges.complementaryCertificationId',
    )
    .where({
      certificationCourseId: juryCertificationDTO.certificationCourseId,
    });

  const badgeIdAndLabels = await _getComplementaryBadgeIdAndLabels({ knexConn, certificationCourseId });

  const certificationIssueReportDTOs = await knexConn('certification-issue-reports')
    .where({ certificationCourseId })
    .orderBy('id', 'ASC');

  return _toDomainWithComplementaryCertifications({
    juryCertificationDTO,
    certificationIssueReportDTOs,
    competenceMarkDTOs,
    complementaryCertificationCourseResultDTOs,
    badgeIdAndLabels,
  });
}

export async function update(juryCertification) {
  const knexConn = DomainTransaction.getConnection();

  await knexConn('assessment-results')
    .update({
      eduV3ExternalJuryResult: juryCertification.eduV3ExternalJuryResult,
    })
    .where('assessment-results.id', '=', function (qb) {
      qb.select('certification-courses-last-assessment-results.lastAssessmentResultId')
        .from('certification-courses-last-assessment-results')
        .join(
          'assessment-results',
          'assessment-results.id',
          'certification-courses-last-assessment-results.lastAssessmentResultId',
        )
        .where(
          'certification-courses-last-assessment-results.certificationCourseId',
          juryCertification.certificationCourseId,
        );
    });
}

function _selectJuryCertifications(knexConn) {
  return knexConn
    .select({
      certificationCourseId: 'certification-courses.id',
      sessionId: 'certification-courses.sessionId',
      userId: 'certification-courses.userId',
      firstName: 'certification-courses.firstName',
      lastName: 'certification-courses.lastName',
      birthdate: 'certification-courses.birthdate',
      sex: 'certification-courses.sex',
      birthplace: 'certification-courses.birthplace',
      birthINSEECode: 'certification-courses.birthINSEECode',
      birthPostalCode: 'certification-courses.birthPostalCode',
      birthCountry: 'certification-courses.birthCountry',
      isPublished: 'certification-courses.isPublished',
      isRejectedForFraud: 'certification-courses.isRejectedForFraud',
      createdAt: 'certification-courses.createdAt',
      version: 'certification-courses.version',
      assessmentId: 'assessments.id',
      assessmentResultId: 'assessment-results.id',
      pixScore: 'assessment-results.pixScore',
      reachedMeshIndex: 'assessment-results.reachedMeshIndex',
      eduV3ExternalJuryResult: 'assessment-results.eduV3ExternalJuryResult',
      juryId: 'assessment-results.juryId',
      assessmentResultStatus: 'assessment-results.status',
      commentForCandidate: 'assessment-results.commentForCandidate',
      commentForOrganization: 'assessment-results.commentForOrganization',
      commentByJury: 'assessment-results.commentByJury',
      commentByAutoJury: 'assessment-results.commentByAutoJury',
      certificationFramework: 'certification-courses.framework',
      lastAnswerAt: 'certification-courses.lastAnswerAt',
      hasScoringConfiguration: knexConn.raw(
        `(certification_versions."globalScoringConfiguration" IS NOT NULL AND jsonb_array_length(certification_versions."globalScoringConfiguration") > 0)`,
      ),
    })
    .from('certification-courses')
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
    )
    .leftJoin('certification_versions', 'certification_versions.id', 'certification-courses.versionId')
    .groupBy('certification-courses.id', 'assessments.id', 'assessment-results.id', 'certification_versions.id');
}

async function _toDomainWithComplementaryCertifications({
  juryCertificationDTO,
  certificationIssueReportDTOs,
  competenceMarkDTOs,
  complementaryCertificationCourseResultDTOs,
  badgeIdAndLabels,
}) {
  const certificationIssueReports = certificationIssueReportDTOs.map(
    (certificationIssueReport) => new CertificationIssueReport({ ...certificationIssueReport }),
  );

  const { complementaryCertificationCourseResultWithExternal, commonComplementaryCertificationCourseResult } =
    _toComplementaryCertificationCourseResultForJuryCertification(
      complementaryCertificationCourseResultDTOs,
      badgeIdAndLabels,
    );

  return JuryCertification.from({
    juryCertificationDTO,
    certificationIssueReports,
    competenceMarkDTOs,
    complementaryCertificationCourseResultWithExternal,
    commonComplementaryCertificationCourseResult,
  });
}

function _toComplementaryCertificationCourseResultForJuryCertification(
  complementaryCertificationCourseResults = [],
  badgeIdAndLabels,
) {
  const complementaryCertificationCourseResultWithExternal = [];
  const commonComplementaryCertificationCourseResult = [];

  complementaryCertificationCourseResults.forEach((certificationCourseResult) => {
    if (certificationCourseResult.hasExternalJury) {
      complementaryCertificationCourseResultWithExternal.push(certificationCourseResult);
    } else {
      commonComplementaryCertificationCourseResult.push(certificationCourseResult);
    }
  });

  const complementaryCertificationCourseResultsForJuryCertificationWithExternal =
    ComplementaryCertificationCourseResultForJuryCertificationWithExternal.from(
      complementaryCertificationCourseResultWithExternal,
      badgeIdAndLabels,
    );

  if (commonComplementaryCertificationCourseResult.length > 1) {
    throw new Error('There should not be more than one complementary certification result without jury');
  }
  const commonComplementaryCertificationCourseResultForJuryCertification =
    commonComplementaryCertificationCourseResult.map(ComplementaryCertificationCourseResultForJuryCertification.from);

  return {
    complementaryCertificationCourseResultWithExternal:
      complementaryCertificationCourseResultsForJuryCertificationWithExternal,
    commonComplementaryCertificationCourseResult: commonComplementaryCertificationCourseResultForJuryCertification?.[0],
  };
}

async function _getComplementaryBadgeIdAndLabels({ knexConn, certificationCourseId }) {
  return knexConn
    .select('complementary-certification-badges.id', 'complementary-certification-badges.label')
    .from('badges')
    .innerJoin('complementary-certification-badges', 'badges.id', 'complementary-certification-badges.badgeId')
    .where(
      'targetProfileId',
      '=',
      knexConn('badges')
        .select('targetProfileId')
        .innerJoin('complementary-certification-badges', 'badges.id', 'complementary-certification-badges.badgeId')
        .innerJoin(
          'complementary-certification-courses',
          'complementary-certification-courses.complementaryCertificationBadgeId',
          'complementary-certification-badges.id',
        )
        .where({ certificationCourseId })
        .first(),
    )
    .orderBy('complementary-certification-badges.level', 'asc');
}
