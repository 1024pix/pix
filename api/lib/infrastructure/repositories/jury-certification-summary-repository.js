const _ = require('lodash');
const { knex } = require('../bookshelf');
const JuryCertificationSummary = require('../../domain/read-models/JuryCertificationSummary');
const CertificationIssueReport = require('../../domain/models/CertificationIssueReport');
const CleaCertificationResult = require('../../domain/models/CleaCertificationResult');
const PixPlusDroitMaitreCertificationResult = require('../../domain/models/PixPlusDroitMaitreCertificationResult');
const PixPlusDroitExpertCertificationResult = require('../../domain/models/PixPlusDroitExpertCertificationResult');

module.exports = {

  async findBySessionId(sessionId) {
    const juryCertificationSummaryRows = await knex.with('certifications_every_assess_results', (qb) => {
      qb.select(
        'certification-courses.*',
        'assessment-results.pixScore',
        'assessment-results.status',
      )
        .select(knex.raw('ROW_NUMBER() OVER (PARTITION BY ?? ORDER BY ?? DESC) AS asr_row_number',
          ['certification-courses.id', 'assessment-results.createdAt']))
        .select(knex.raw('\'[\' || (string_agg(\'{ "acquired":\' || "partner-certifications".acquired::VARCHAR || \', "partnerKey":"\' || "partner-certifications"."partnerKey" || \'"}\', \',\') over (partition by "certification-courses".id)) || \']\' as "partnerCertifications"'))
        .from('certification-courses')
        .leftJoin('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
        .leftJoin('assessment-results', 'assessment-results.assessmentId', 'assessments.id')
        .leftJoin('partner-certifications', 'partner-certifications.certificationCourseId', 'certification-courses.id')
        .where('certification-courses.sessionId', sessionId);
    })
      .select('*')
      .from('certifications_every_assess_results')
      .where('asr_row_number', 1)
      .orderBy('lastName', 'ASC')
      .orderBy('firstName', 'ASC');

    const certificationCourseIds = juryCertificationSummaryRows.map((row) => row.id);
    const certificationIssueReportRows = await knex('certification-issue-reports')
      .whereIn('certificationCourseId', certificationCourseIds);

    const juryCertificationSummaryDTOs = _buildJuryCertificationSummaryDTOs(
      juryCertificationSummaryRows,
      certificationIssueReportRows);

    return _.map(juryCertificationSummaryDTOs, _toDomain);
  },
};

function _buildJuryCertificationSummaryDTOs(juryCertificationSummaryRows, certificationIssueReportRows) {
  return juryCertificationSummaryRows.map((juryCertificationSummaryRow) => {
    const matchingCertificationIssueReportRows = _.filter(certificationIssueReportRows, {
      certificationCourseId: juryCertificationSummaryRow.id,
    });
    return {
      ...juryCertificationSummaryRow,
      certificationIssueReports: matchingCertificationIssueReportRows.map((certificationIssueReportRow) => ({ ...certificationIssueReportRow })),
    };
  });
}

function _toDomain(juryCertificationSummaryDTO) {
  const certificationIssueReports =
    juryCertificationSummaryDTO.certificationIssueReports.map((certificationIssueReportDTO) => {
      return new CertificationIssueReport(certificationIssueReportDTO);
    });

  const {
    cleaCertificationResult,
    pixPlusDroitMaitreCertificationResult,
    pixPlusDroitExpertCertificationResult,
  } = _getPartnerCertificationsResult(juryCertificationSummaryDTO.partnerCertifications);
  return new JuryCertificationSummary({
    ...juryCertificationSummaryDTO,
    certificationIssueReports,
    cleaCertificationResult,
    pixPlusDroitMaitreCertificationResult,
    pixPlusDroitExpertCertificationResult,
  });
}

function _getPartnerCertificationsResult(partnerCertificationsJSON) {
  const partnerCertifications = JSON.parse(partnerCertificationsJSON) || [];
  const cleaCertificationCertification = _.find(partnerCertifications, { partnerKey: CleaCertificationResult.badgeKey });
  const pixPlusDroitMaitreCertification = _.find(partnerCertifications, { partnerKey: PixPlusDroitMaitreCertificationResult.badgeKey });
  const pixPlusDroitExpertCertification = _.find(partnerCertifications, { partnerKey: PixPlusDroitExpertCertificationResult.badgeKey });

  return {
    cleaCertificationResult: cleaCertificationCertification ? CleaCertificationResult.buildFrom(cleaCertificationCertification) : CleaCertificationResult.buildNotTaken(),
    pixPlusDroitMaitreCertificationResult: pixPlusDroitMaitreCertification ? PixPlusDroitMaitreCertificationResult.buildFrom(pixPlusDroitMaitreCertification) : PixPlusDroitMaitreCertificationResult.buildNotTaken(),
    pixPlusDroitExpertCertificationResult: pixPlusDroitExpertCertification ? PixPlusDroitExpertCertificationResult.buildFrom(pixPlusDroitExpertCertification) : PixPlusDroitExpertCertificationResult.buildNotTaken(),
  };
}
