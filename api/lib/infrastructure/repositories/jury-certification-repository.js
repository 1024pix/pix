const { knex } = require('../../../db/knex-database-connection');
const { NotFoundError } = require('../../domain/errors');
const _ = require('lodash');
const JuryCertification = require('../../domain/models/JuryCertification');
const CertificationIssueReport = require('../../domain/models/CertificationIssueReport');
const ComplementaryCertificationCourseResultsForJuryCertification = require('../../domain/read-models/ComplementaryCertificationCourseResultsForJuryCertification');
const ComplementaryCertificationCourseResultsForJuryCertificationWithExternal = require('../../domain/read-models/ComplementaryCertificationCourseResultsForJuryCertificationWithExternal');

module.exports = {
  async get(certificationCourseId) {
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
      .leftJoin(
        'complementary-certification-courses',
        'complementary-certification-course-results.complementaryCertificationCourseId',
        'complementary-certification-courses.id'
      )
      .where({
        certificationCourseId: juryCertificationDTO.certificationCourseId,
      });

    const certificationIssueReportDTOs = await knex('certification-issue-reports')
      .where({ certificationCourseId })
      .orderBy('id', 'ASC');

    return _toDomainWithComplementaryCertifications({
      juryCertificationDTO,
      certificationIssueReportDTOs,
      competenceMarkDTOs,
      complementaryCertificationCourseResultDTOs,
    });
  },
};

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
    .leftJoin('assessment-results', 'assessment-results.assessmentId', 'assessments.id')
    .modify(_filterMostRecentAssessmentResult)
    .groupBy('certification-courses.id', 'assessments.id', 'assessment-results.id');
}

function _filterMostRecentAssessmentResult(qb) {
  return qb.whereNotExists(
    knex
      .select(1)
      .from({ 'last-assessment-results': 'assessment-results' })
      .whereRaw('"last-assessment-results"."assessmentId" = assessments.id')
      .whereRaw('"assessment-results"."createdAt" < "last-assessment-results"."createdAt"')
  );
}

async function _toDomainWithComplementaryCertifications({
  juryCertificationDTO,
  certificationIssueReportDTOs,
  competenceMarkDTOs,
  complementaryCertificationCourseResultDTOs,
}) {
  const certificationIssueReports = certificationIssueReportDTOs.map(
    (certificationIssueReport) =>
      new CertificationIssueReport({
        id: certificationIssueReport.id,
        certificationCourseId: certificationIssueReport.certificationCourseId,
        category: certificationIssueReport.category,
        description: certificationIssueReport.description,
        subcategory: certificationIssueReport.subcategory,
        questionNumber: certificationIssueReport.questionNumber,
        resolvedAt: certificationIssueReport.resolvedAt,
        resolution: certificationIssueReport.resolution,
      })
  );

  const [complementaryCertificationCourseResultsWithExternal, commonComplementaryCertificationCourseResults] =
    _toComplementaryCertificationCourseResultForJuryCertification(complementaryCertificationCourseResultDTOs);

  return JuryCertification.from({
    juryCertificationDTO,
    certificationIssueReports,
    competenceMarkDTOs,
    complementaryCertificationCourseResultsWithExternal,
    commonComplementaryCertificationCourseResults,
  });
}

function _toComplementaryCertificationCourseResultForJuryCertification(complementaryCertificationCourseResults) {
  const [complementaryCertificationCourseResultsWithExternal, commonComplementaryCertificationCourseResults] =
    _.partition(complementaryCertificationCourseResults, (ccr) => {
      return ccr.partnerKey.startsWith('PIX_EDU');
    });

  const complementaryCertificationCourseResultsForJuryCertificationWithExternal =
    ComplementaryCertificationCourseResultsForJuryCertificationWithExternal.from(
      complementaryCertificationCourseResultsWithExternal
    );

  const commonComplementaryCertificationCourseResultsForJuryCertification =
    commonComplementaryCertificationCourseResults.map(
      ({ id, partnerKey, acquired }) =>
        new ComplementaryCertificationCourseResultsForJuryCertification({ id, partnerKey, acquired })
    );

  return [
    complementaryCertificationCourseResultsForJuryCertificationWithExternal,
    commonComplementaryCertificationCourseResultsForJuryCertification,
  ];
}
