const Certificate = require('../../domain/read-models/livret-scolaire/Certificate');
const { knex } = require('../bookshelf');

module.exports = {

  async getCertificatesByOrganizationUAI(uai) {
    const withName = 'last-certifications';
    const result = await knex.with(withName,
      knex.distinct('certification-courses.id')
        .select(
          {
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
            assessmentResultsCreatedAt: 'assessment-results.createdAt',
            pixScore: 'assessment-results.pixScore',
            userId: 'schooling-registrations.userId',
            assessmentId: 'assessments.id',
          },
        )
        .select(knex.raw('\'[\' || (string_agg(\'{ "level":\' || "competence-marks".level::VARCHAR || \', "competenceId":"\' || "competence-marks"."competence_code" || \'"}\', \',\') over (partition by "assessment-results".id)) || \']\' as "competenceResultsJson"'))
        .from('certification-courses')
        .innerJoin('schooling-registrations', 'schooling-registrations.userId', 'certification-courses.userId')
        .innerJoin('organizations', 'schooling-registrations.organizationId', 'organizations.id')
        .innerJoin('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
        .innerJoin('assessment-results', 'assessment-results.assessmentId', 'assessments.id')
        .innerJoin('sessions', 'sessions.id', 'certification-courses.sessionId')
        .innerJoin('competence-marks', 'competence-marks.assessmentResultId', 'assessment-results.id')
        .modify(_filterMostRecentCertificationCourse)
        .where('certification-courses.isCancelled', '=', false)
        .whereRaw('LOWER("organizations"."externalId") = LOWER(?)', uai),
    )
      .select(knex.ref('*').withSchema(withName))
      .from(withName)
      .modify(_filterMostRecentAssessmentsResults)
      .orderBy(`${withName}.lastName`, 'ASC')
      .orderBy(`${withName}.firstName`, 'ASC');

    return result.map(Certificate.from);

    function _filterMostRecentAssessmentsResults(queryBuilder) {
      const lastAssessmentAlias = 'last-assessment';
      queryBuilder
        .leftJoin({ [lastAssessmentAlias]: 'assessment-results' }, function() {
          this.on(`${lastAssessmentAlias}.assessmentId`, `${withName}.assessmentId`)
            .andOn(`${withName}.assessmentResultsCreatedAt`, '<', knex.ref(`${lastAssessmentAlias}.createdAt`));
        })
        .whereNull(lastAssessmentAlias);

    }

    function _filterMostRecentCertificationCourse(queryBuilder) {
      const lastCertificationAlias = 'last-certification';
      queryBuilder
        .leftJoin({ [lastCertificationAlias]: 'certification-courses' }, function() {
          this.on(`${lastCertificationAlias}.userId`, 'certification-courses.userId')
            .andOn('certification-courses.createdAt', '<', knex.ref(`${lastCertificationAlias}.createdAt`));
        })
        .whereNull(lastCertificationAlias);

    }

  },
};
