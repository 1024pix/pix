const { knex } = require('../../../db/knex-database-connection');

const { NotFoundError } = require('../../domain/errors');
const GeneralCertificationInformation = require('../../domain/read-models/GeneralCertificationInformation');
const CertificationIssueReport = require('../../domain/models/CertificationIssueReport');

module.exports = {

  async get({ certificationCourseId }) {
    const certificationCourseDTO = await knex('certification-courses')
      .where({ id: certificationCourseId })
      .orderBy('createdAt')
      .first();

    if (certificationCourseDTO) {
      const certificationIssueReportsDTO = await knex('certification-issue-reports')
        .where({ certificationCourseId });

      return _toDomain({ certificationCourseDTO, certificationIssueReportsDTO });
    }
    throw new NotFoundError(`Certification course of id ${certificationCourseId} does not exist.`);
  },
};

function _toDomain({ certificationCourseDTO, certificationIssueReportsDTO }) {
  const certificationIssueReports = certificationIssueReportsDTO
    .map((certificationIssueReport) =>
      new CertificationIssueReport({
        id: certificationIssueReport.id,
        certificationCourseId: certificationIssueReport.certificationCourseId,
        category: certificationIssueReport.category,
        description: certificationIssueReport.description,
        subcategory: certificationIssueReport.subcategory,
        questionNumber: certificationIssueReport.questionNumber,
      }),
    );

  return new GeneralCertificationInformation({
    certificationCourseId: certificationCourseDTO.id,
    sessionId: certificationCourseDTO.sessionId,
    createdAt: certificationCourseDTO.createdAt,
    completedAt: certificationCourseDTO.completedAt,
    isPublished: certificationCourseDTO.isPublished,
    isCancelled: certificationCourseDTO.isCancelled,
    isV2Certification: certificationCourseDTO.isV2Certification,
    firstName: certificationCourseDTO.firstName,
    lastName: certificationCourseDTO.lastName,
    birthdate: certificationCourseDTO.birthdate,
    birthplace: certificationCourseDTO.birthplace,
    certificationIssueReports,
  });
}
