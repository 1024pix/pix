const Certificate = require('../../domain/read-models/livret-scolaire/Certificate');
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
        isPublished: 'certification-courses.isPublished',
        status: 'assessment-results.status',
        pixScore: 'assessment-results.pixScore',
      })
      .select(knex.raw('\'[\' || (string_agg(\'{ "level":\' || "competence-marks".level::VARCHAR || \', "competenceId":"\' || "competence-marks"."competence_code" || \'"}\', \',\') over (partition by "assessment-results".id)) || \']\' as "competenceResultsJson"'))
      .from('certification-courses')
      .innerJoin('schooling-registrations', 'schooling-registrations.userId', 'certification-courses.userId')
      .innerJoin('organizations', 'schooling-registrations.organizationId', 'organizations.id')
      .innerJoin('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
      .innerJoin('assessment-results', 'assessment-results.assessmentId', 'assessments.id')
      .innerJoin('sessions', 'sessions.id', 'certification-courses.sessionId')
      .innerJoin('competence-marks', 'competence-marks.assessmentResultId', 'assessment-results.id')
      .modify(_filterMostRecentAssessments)
      .whereNull('last-assessment-results')
      .andWhereRaw('LOWER("organizations"."externalId") = LOWER(?)', uai)
      .orderBy('lastName', 'ASC')
      .orderBy('firstName', 'ASC');

    return result.map(Certificate.from);

  },
};

function _filterMostRecentAssessments(queryBuilder) {
  queryBuilder
    .leftJoin({ 'last-assessment-results': 'assessment-results' }, function() {
      this.on('last-assessment-results.assessmentId', 'assessments.id')
        .andOn('assessment-results.createdAt', '<', knex.ref('last-assessment-results.createdAt'));
    });
}
