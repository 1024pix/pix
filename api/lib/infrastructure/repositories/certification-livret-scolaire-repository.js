const bluebird = require('bluebird');
const CompetenceMarksBookshelf = require('../data/competence-mark');
const Certificate = require('../../domain/read-models/livret-scolaire/Certificate');
const CompetenceResults = require('../../domain/read-models/livret-scolaire/CompetenceResults');
const PENDING_STATUS = require('../../domain/read-models/livret-scolaire/CertificateStatus').PENDING;
const { knex } = require('../bookshelf');

module.exports = {

  async getCertificatesByOrganizationUAI(uai) {
    const results = await knex.with('organization_certifications_every_assess_results', (qb) => {
      qb.select({
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
        isPublished: 'certification-courses.isPublished',
        certificationCenter: 'sessions.certificationCenter',
        assessmentResultId: 'assessment-results.id',
        status: 'assessment-results.status',
        pixScore: 'assessment-results.pixScore',
      })
        .select(knex.raw('ROW_NUMBER() OVER (PARTITION BY ?? ORDER BY ?? DESC) AS asr_row_number',
          ['certification-courses.id', 'assessment-results.createdAt']))
        .from('certification-courses')
        .join('schooling-registrations', 'schooling-registrations.userId', 'certification-courses.userId')
        .join('organizations', 'schooling-registrations.organizationId', 'organizations.id')
        .join('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
        .join('assessment-results', 'assessment-results.assessmentId', 'assessments.id')
        .join('sessions', 'sessions.id', 'certification-courses.sessionId')
        .where('organizations.externalId', '=', uai);
    })
      .select('*')
      .from('organization_certifications_every_assess_results')
      .where('asr_row_number', '1')
      .orderBy('lastName', 'ASC')
      .orderBy('firstName', 'ASC');

    return bluebird.mapSeries(results, async (result) => {
      //FIXME transform to get competences results by chunk of X certifications
      const competenceResults = await _getCompetenceResults(result.assessmentResultId);

      return new Certificate({
        ...result,
        status: result.isPublished ? result.status : PENDING_STATUS,
        competenceResults,
      });
    });
  },
};

async function _getCompetenceResults(assessmentResultId) {
  const competenceMarks = await CompetenceMarksBookshelf
    .query((qb) => {
      qb.where('assessmentResultId', '=', assessmentResultId);
    })
    .orderBy('competence_code', 'asc')
    .fetchAll({ columns: ['competence_code', 'level'], required: true });

  return competenceMarks.models.map(({ attributes: cm }) =>
    new CompetenceResults({ level: cm.level, competenceId: cm.competence_code }));
}

