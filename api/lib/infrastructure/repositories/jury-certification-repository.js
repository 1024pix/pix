const { knex } = require('../../../db/knex-database-connection');
const { NotFoundError } = require('../../domain/errors');
const _ = require('lodash');
const JuryCertification = require('../../domain/models/JuryCertification');
const CertificationIssueReport = require('../../domain/models/CertificationIssueReport');
const PartnerCertification = require('../../domain/models/PartnerCertification');

module.exports = {
  async get(certificationCourseId) {
    const juryCertificationDTO = await _selectJuryCertifications()
      .where('certification-courses.id', certificationCourseId)
      .first();

    if (!juryCertificationDTO) {
      throw new NotFoundError(`Certification course of id ${certificationCourseId} does not exist.`);
    }

    const certificationIssueReportDTOs = await knex('certification-issue-reports')
      .where({ certificationCourseId })
      .orderBy('id', 'ASC');

    return _toDomainWithComplementaryCertifications({ juryCertificationDTO, certificationIssueReportDTOs });
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
      pixScore: 'assessment-results.pixScore',
      juryId: 'assessment-results.juryId',
      assessmentResultStatus: 'assessment-results.status',
      commentForCandidate: 'assessment-results.commentForCandidate',
      commentForOrganization: 'assessment-results.commentForOrganization',
      commentForJury: 'assessment-results.commentForJury',
      competenceMarks: knex.raw('json_agg("competence-marks".* ORDER BY "competence-marks"."competence_code" asc)'),
      partnerCertifications: knex.raw('json_agg("partner-certifications".*)'),
    })
    .from('certification-courses')
    .join('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
    .leftJoin('assessment-results', 'assessment-results.assessmentId', 'assessments.id')
    .modify(_filterMostRecentAssessmentResult)
    .leftJoin('competence-marks', 'competence-marks.assessmentResultId', 'assessment-results.id')
    .leftJoin('partner-certifications', 'partner-certifications.certificationCourseId', 'certification-courses.id')
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

async function _toDomainWithComplementaryCertifications({ juryCertificationDTO, certificationIssueReportDTOs }) {
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

  const partnerCertifications = _.compact(juryCertificationDTO.partnerCertifications).map(PartnerCertification.from);

  return JuryCertification.from({
    juryCertificationDTO,
    certificationIssueReports,
    partnerCertifications,
  });
}
