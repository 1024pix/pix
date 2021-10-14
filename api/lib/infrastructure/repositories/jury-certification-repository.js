const { knex } = require('../../../db/knex-database-connection');
const { NotFoundError } = require('../../domain/errors');
const JuryCertification = require('../../domain/models/JuryCertification');
const CertificationIssueReport = require('../../domain/models/CertificationIssueReport');
const cleaCertificationResultRepository = require('./clea-certification-result-repository');
const pixPlusDroitMaitreCertificationResultRepository = require('./pix-plus-droit-maitre-certification-result-repository');
const pixPlusDroitExpertCertificationResultRepository = require('./pix-plus-droit-expert-certification-result-repository');

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
    })
    .from('certification-courses')
    .join('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
    .leftJoin('assessment-results', 'assessment-results.assessmentId', 'assessments.id')
    .modify(_filterMostRecentAssessmentResult)
    .leftJoin('competence-marks', 'competence-marks.assessmentResultId', 'assessment-results.id')
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

  const cleaCertificationResult = await cleaCertificationResultRepository.get({
    certificationCourseId: juryCertificationDTO.certificationCourseId,
  });
  const pixPlusDroitMaitreCertificationResult = await pixPlusDroitMaitreCertificationResultRepository.get({
    certificationCourseId: juryCertificationDTO.certificationCourseId,
  });
  const pixPlusDroitExpertCertificationResult = await pixPlusDroitExpertCertificationResultRepository.get({
    certificationCourseId: juryCertificationDTO.certificationCourseId,
  });

  return JuryCertification.from({
    juryCertificationDTO,
    cleaCertificationResult,
    pixPlusDroitMaitreCertificationResult,
    pixPlusDroitExpertCertificationResult,
    certificationIssueReports,
  });
}
