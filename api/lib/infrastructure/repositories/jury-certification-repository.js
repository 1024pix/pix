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
      'complementary-certification-course-results.*',
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
    .leftJoin('badges', 'badges.key', 'complementary-certification-course-results.partnerKey')
    .leftJoin('complementary-certification-badges', 'complementary-certification-badges.badgeId', 'badges.id')
    .leftJoin(
      'complementary-certifications',
      'complementary-certifications.id',
      'complementary-certification-badges.complementaryCertificationId',
    )
    .where({
      certificationCourseId: juryCertificationDTO.certificationCourseId,
    });

  const badgesKeyAndLabel = await _getComplementaryBadgesKeyAndLabel({ certificationCourseId });

  const certificationIssueReportDTOs = await knex('certification-issue-reports')
    .where({ certificationCourseId })
    .orderBy('id', 'ASC');

  return _toDomainWithComplementaryCertifications({
    juryCertificationDTO,
    certificationIssueReportDTOs,
    competenceMarkDTOs,
    complementaryCertificationCourseResultDTOs,
    badgesKeyAndLabel,
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
  badgesKeyAndLabel,
}) {
  const certificationIssueReports = certificationIssueReportDTOs.map(
    (certificationIssueReport) => new CertificationIssueReport({ ...certificationIssueReport }),
  );

  const { complementaryCertificationCourseResultWithExternal, commonComplementaryCertificationCourseResult } =
    _toComplementaryCertificationCourseResultForJuryCertification(
      complementaryCertificationCourseResultDTOs,
      badgesKeyAndLabel,
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
  badgesKeyAndLabel,
) {
  const [complementaryCertificationCourseResultWithExternal, commonComplementaryCertificationCourseResult] =
    _.partition(complementaryCertificationCourseResults, 'hasExternalJury');

  const complementaryCertificationCourseResultsForJuryCertificationWithExternal =
    ComplementaryCertificationCourseResultForJuryCertificationWithExternal.from(
      complementaryCertificationCourseResultWithExternal,
      badgesKeyAndLabel,
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

async function _getComplementaryBadgesKeyAndLabel({ certificationCourseId }) {
  return knex('complementary-certification-badges')
    .select('badges.key', 'complementary-certification-badges.label')
    .join(
      'complementary-certifications',
      'complementary-certifications.id',
      'complementary-certification-badges.complementaryCertificationId',
    )
    .join('badges', 'badges.id', 'complementary-certification-badges.badgeId')
    .join(
      'complementary-certification-courses',
      'complementary-certifications.id',
      'complementary-certification-courses.complementaryCertificationId',
    )
    .orderBy('complementary-certification-badges.label')
    .where({ certificationCourseId });
}
