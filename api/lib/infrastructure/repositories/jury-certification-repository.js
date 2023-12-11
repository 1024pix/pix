import { knex } from '../../../db/knex-database-connection.js';
import { NotFoundError } from '../../domain/errors.js';
import _ from 'lodash';
import { JuryCertification } from '../../domain/models/JuryCertification.js';
import { CertificationIssueReport } from '../../../src/certification/shared/domain/models/CertificationIssueReport.js';
import { ComplementaryCertificationCourseResultForJuryCertification } from '../../domain/read-models/ComplementaryCertificationCourseResultForJuryCertification.js';
import { ComplementaryCertificationCourseResultForJuryCertificationWithExternal } from '../../domain/read-models/ComplementaryCertificationCourseResultForJuryCertificationWithExternal.js';

const get = async function (certificationCourseId) {
  const juryCertificationDTO = await _selectJuryCertifications()
    .where('certification-courses.id', certificationCourseId)
    .first();

  if (!juryCertificationDTO) {
    throw new NotFoundError(`Certification course of id ${certificationCourseId} does not exist.`);
  }

  const competenceMarkDTOs = await knex('competence-marks')
    .where({
      assessmentResultId: juryCertificationDTO.assessmentResultId,
    })
    .orderBy('competence_code', 'asc');

  const complementaryCertificationCourseResultDTOs = await knex('complementary-certification-course-results')
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

  const badgeIdAndLabels = await _getComplementaryBadgeIdAndLabels({ certificationCourseId });

  const certificationIssueReportDTOs = await knex('certification-issue-reports')
    .where({ certificationCourseId })
    .orderBy('id', 'ASC');

  return _toDomainWithComplementaryCertifications({
    juryCertificationDTO,
    certificationIssueReportDTOs,
    competenceMarkDTOs,
    complementaryCertificationCourseResultDTOs,
    badgeIdAndLabels,
  });
};

export { get };

function _selectJuryCertifications() {
  return knex
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
      isCancelled: 'certification-courses.isCancelled',
      isPublished: 'certification-courses.isPublished',
      isRejectedForFraud: 'certification-courses.isRejectedForFraud',
      createdAt: 'certification-courses.createdAt',
      completedAt: 'certification-courses.completedAt',
      version: 'certification-courses.version',
      assessmentId: 'assessments.id',
      assessmentResultId: 'assessment-results.id',
      pixScore: 'assessment-results.pixScore',
      juryId: 'assessment-results.juryId',
      assessmentResultStatus: 'assessment-results.status',
      commentForCandidate: 'assessment-results.commentForCandidate',
      commentForOrganization: 'assessment-results.commentForOrganization',
      commentForJury: 'assessment-results.commentForJury',
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
    .groupBy('certification-courses.id', 'assessments.id', 'assessment-results.id');
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
  complementaryCertificationCourseResults,
  badgeIdAndLabels,
) {
  const [complementaryCertificationCourseResultWithExternal, commonComplementaryCertificationCourseResult] =
    _.partition(complementaryCertificationCourseResults, 'hasExternalJury');

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

async function _getComplementaryBadgeIdAndLabels({ certificationCourseId }) {
  return knex
    .select('complementary-certification-badges.id', 'complementary-certification-badges.label')
    .from('badges')
    .innerJoin('complementary-certification-badges', 'badges.id', 'complementary-certification-badges.badgeId')
    .where(
      'targetProfileId',
      '=',
      knex('badges')
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
