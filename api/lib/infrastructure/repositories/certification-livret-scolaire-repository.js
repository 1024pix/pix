const Certificate = require('../../domain/read-models/livret-scolaire/Certificate');
const { knex } = require('../bookshelf');

module.exports = {

  async getCertificatesByOrganizationUAI(uai) {

    const result = await knex.select(
      {
        id: 'certification-courses.id',
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
      .select(knex.raw('\'[\' || (string_agg(\'{ "level":\' || "competence-marks".level::VARCHAR || \', "competenceId":"\' || "competence-marks"."competence_code" || \'"}\', \',\')) || \']\' as "competenceResultsJson"'))
      .from('certification-courses')
      .innerJoin('schooling-registrations', 'schooling-registrations.userId', 'certification-courses.userId')
      .innerJoin('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
      .innerJoin('assessment-results', 'assessment-results.assessmentId', 'assessments.id')
      .innerJoin('sessions', 'sessions.id', 'certification-courses.sessionId')
      .innerJoin('competence-marks', 'competence-marks.assessmentResultId', 'assessment-results.id')
      .whereNotExists(
        knex.select(1)
          .from({ 'last-certification-courses': 'certification-courses' })
          .whereRaw('"last-certification-courses"."userId" = "certification-courses"."userId"')
          .whereRaw('"last-certification-courses"."isCancelled"= false')
          .whereRaw('"certification-courses"."createdAt" < "last-certification-courses"."createdAt"'),
      )
      .whereNotExists(
        knex.select(1)
          .from({ 'last-assessment-results': 'assessment-results' })
          .whereRaw('"last-assessment-results"."assessmentId" = assessments.id')
          .whereRaw('"assessment-results"."createdAt" < "last-assessment-results"."createdAt"'),
      )

      .where('certification-courses.isCancelled', '=', false)
      .where('schooling-registrations.organizationId', '=', knex.select('id').from('organizations').whereRaw('LOWER("externalId") = LOWER(?)', uai))

      .groupBy('schooling-registrations.id', 'certification-courses.id', 'sessions.id', 'assessments.id', 'assessment-results.id')

      .orderBy('lastName', 'ASC')
      .orderBy('firstName', 'ASC');

    return result.map(Certificate.from);
  },
};
