import { knex } from '../../../db/knex-database-connection.js';
import { Certificate } from '../../../src/shared/domain/read-models/livret-scolaire/Certificate.js';

const getCertificatesByOrganizationUAI = async function (uai) {
  const result = await knex
    .select({
      id: 'certification-courses.id',
      firstName: 'view-active-organization-learners.firstName',
      middleName: 'view-active-organization-learners.middleName',
      thirdName: 'view-active-organization-learners.thirdName',
      lastName: 'view-active-organization-learners.lastName',
      birthdate: 'view-active-organization-learners.birthdate',
      nationalStudentId: 'view-active-organization-learners.nationalStudentId',
      date: 'certification-courses.createdAt',
      verificationCode: 'certification-courses.verificationCode',
      deliveredAt: 'sessions.publishedAt',
      certificationCenter: 'sessions.certificationCenter',
      isPublished: 'certification-courses.isPublished',
      status: 'assessment-results.status',
      pixScore: 'assessment-results.pixScore',
      competenceResults: knex.raw(`
      json_agg(
        json_build_object('level', "competence-marks".level, 'competenceId', "competence-marks"."competence_code")
        ORDER BY "competence-marks"."competence_code" asc
      )`),
    })
    .from('certification-courses')
    .innerJoin(
      'view-active-organization-learners',
      'view-active-organization-learners.userId',
      'certification-courses.userId',
    )
    .innerJoin('sessions', 'sessions.id', 'certification-courses.sessionId')
    .innerJoin(
      'certification-courses-last-assessment-results',
      'certification-courses.id',
      'certification-courses-last-assessment-results.certificationCourseId',
    )
    .innerJoin(
      'assessment-results',
      'assessment-results.id',
      'certification-courses-last-assessment-results.lastAssessmentResultId',
    )
    .innerJoin('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
    .innerJoin('competence-marks', 'competence-marks.assessmentResultId', 'assessment-results.id')
    .whereNotExists(
      knex
        .select(1)
        .from({ 'last-certification-courses': 'certification-courses' })
        .whereRaw('"last-certification-courses"."userId" = "certification-courses"."userId"')
        .whereRaw('"last-certification-courses"."isCancelled"= false')
        .whereRaw('"certification-courses"."createdAt" < "last-certification-courses"."createdAt"'),
    )

    .where({ 'certification-courses.isCancelled': false })
    .where({ 'view-active-organization-learners.isDisabled': false })
    .where(
      'view-active-organization-learners.organizationId',
      '=',
      knex.select('id').from('organizations').whereRaw('LOWER("externalId") = LOWER(?)', uai),
    )

    .groupBy(
      'view-active-organization-learners.id',
      'view-active-organization-learners.firstName',
      'view-active-organization-learners.middleName',
      'view-active-organization-learners.thirdName',
      'view-active-organization-learners.lastName',
      'view-active-organization-learners.birthdate',
      'view-active-organization-learners.nationalStudentId',
      'certification-courses.id',
      'sessions.id',
      'assessments.id',
      'assessment-results.id',
    )

    .orderBy('lastName', 'ASC')
    .orderBy('firstName', 'ASC')
    .orderBy('id', 'ASC');

  return result.map(Certificate.from);
};

export { getCertificatesByOrganizationUAI };
