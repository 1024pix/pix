const { knex } = require('../../bookshelf.js');
const { fetchPage } = require('../../utils/knex-utils.js');
const SessionSummary = require('../../../domain/read-models/SessionSummary.js');

module.exports = {
  async findPaginatedByCertificationCenterId({ certificationCenterId, page }) {
    const query = knex('sessions')
      .distinct('sessions.id')
      .select({
        id: 'sessions.id',
        address: 'sessions.address',
        room: 'sessions.room',
        date: 'sessions.date',
        time: 'sessions.time',
        examiner: 'sessions.examiner',
        finalizedAt: 'sessions.finalizedAt',
        publishedAt: 'sessions.publishedAt',
        createdAt: 'sessions.createdAt',
      })
      .select(
        knex.raw(
          'COUNT(*) FILTER (WHERE "certification-candidates"."id" IS NOT NULL) OVER (partition by "sessions"."id") AS "enrolledCandidatesCount"'
        ),
        knex.raw(
          'COUNT(*) FILTER (WHERE "certification-courses"."id" IS NOT NULL) OVER (partition by "sessions"."id") AS "effectiveCandidatesCount"'
        )
      )
      .leftJoin('certification-candidates', 'certification-candidates.sessionId', 'sessions.id')
      .leftJoin('certification-courses', function () {
        this.on('certification-courses.userId', 'certification-candidates.userId').andOn(
          'certification-courses.sessionId',
          'certification-candidates.sessionId'
        );
      })
      .where({ certificationCenterId })
      .orderBy('sessions.date', 'DESC')
      .orderBy('sessions.time', 'DESC')
      .orderBy('sessions.id', 'ASC');

    const { results, pagination } = await fetchPage(query, page);
    const atLeastOneSession = await knex('sessions').select('id').where({ certificationCenterId }).first();
    const hasSessions = Boolean(atLeastOneSession);

    const sessionSummaries = results.map((result) => SessionSummary.from(result));
    return { models: sessionSummaries, meta: { ...pagination, hasSessions } };
  },
};
