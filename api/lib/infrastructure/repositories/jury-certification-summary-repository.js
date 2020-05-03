const _ = require('lodash');
const { knex } = require('../bookshelf');
const JuryCertificationSummary = require('../../domain/read-models/JuryCertificationSummary');

module.exports = {

  async findBySessionId(sessionId) {
    const results = await knex.with('certifications_every_assess_results', (qb) => {
      qb.select('certification-courses.*', 'assessment-results.pixScore', 'assessment-results.status')
        .select(knex.raw('ROW_NUMBER() OVER (PARTITION BY ?? ORDER BY ?? DESC) AS asr_rank',
          ['assessmentId', 'assessment-results.createdAt']))
        .from('certification-courses')
        .leftJoin('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
        .leftJoin('assessment-results', 'assessment-results.assessmentId', 'assessments.id')
        .where('certification-courses.sessionId', sessionId);
    })
      .select('*')
      .from('certifications_every_assess_results')
      .where('asr_rank', 1)
      .orWhereNull('asr_rank')
      .orderBy('lastName', 'ASC')
      .orderBy('firstName', 'ASC');

    return _.map(results, _toDomain);
  }
};

function _toDomain(juryCertificationSummaryFromDB) {
  return new JuryCertificationSummary({
    ...juryCertificationSummaryFromDB,
  });
}
