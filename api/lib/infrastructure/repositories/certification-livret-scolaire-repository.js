const Certificate = require('../../domain/read-models/livret-scolaire/Certificate');
const PENDING_STATUS = require('../../domain/read-models/livret-scolaire/CertificateStatus').PENDING;
const { knex } = require('../bookshelf');

module.exports = {

  async getCertificatesByOrganizationUAI(uai) {
    const result = await knex
      .distinct('certification-courses.id')
      .select({
        firstName: 'schooling-registrations.firstName',
        middleName: 'schooling-registrations.middleName',
        thirdName: 'schooling-registrations.thirdName',
        lastName: 'schooling-registrations.lastName',
        birthdate: 'schooling-registrations.birthdate',
        nationalStudentId: 'schooling-registrations.nationalStudentId',
        date: 'certification-courses.createdAt',
        verificationCode: 'certification-courses.verificationCode',
        deliveredAt: 'sessions.publishedAt',
        certificationCenter: 'sessions.certificationCenter',
        // eslint-disable-next-line no-restricted-syntax
        status: knex.raw(`CASE WHEN "isPublished" THEN "assessment-results".status ELSE '${PENDING_STATUS}' END`),
        pixScore: 'assessment-results.pixScore',
      })
      .select(knex.raw('\'[\' || (string_agg(\'{ "level":\' || "competence-marks".level::VARCHAR || \', "competenceId":"\' || "competence-marks"."competence_code" || \'"}\', \',\') over (partition by "assessment-results".id)) || \']\' as "competenceResults"'))
      .from('certification-courses')
      .innerJoin('schooling-registrations', 'schooling-registrations.userId', 'certification-courses.userId')
      .innerJoin('organizations', 'schooling-registrations.organizationId', 'organizations.id')
      .innerJoin('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
      .innerJoin('assessment-results', 'assessment-results.assessmentId', 'assessments.id')
      .innerJoin('sessions', 'sessions.id', 'certification-courses.sessionId')
      .innerJoin('competence-marks', 'competence-marks.assessmentResultId', 'assessment-results.id')
      .modify(_filterMostRecentAssessments)
      .whereRaw(`LOWER("organizations"."externalId") = LOWER('${uai}')`)
      .andWhereRaw('"last-assessment-results".id is null')
      .orderBy('lastName', 'ASC')
      .orderBy('firstName', 'ASC');

    return result.map((certificate) => {
      const competenceResults = JSON.parse(certificate.competenceResults);
      return new Certificate({
        ...certificate, competenceResults,
      });
    });

  },
};

function _filterMostRecentAssessments(queryBuilder) {
  queryBuilder
    .leftJoin({ 'last-assessment-results': 'assessment-results' }, function() {
      this.on('last-assessment-results.assessmentId', 'assessments.id')
        .andOn('assessment-results.createdAt', '<', knex.ref('last-assessment-results.createdAt'));
    });

}
