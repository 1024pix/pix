import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { fetchPage } from '../../../../shared/infrastructure/utils/knex-utils.js';
import { SessionSummary } from '../../domain/read-models/SessionSummary.js';

const findPaginatedByCertificationCenterId = async function ({ certificationCenterId, page }) {
  const knexConn = DomainTransaction.getConnection();
  const query = knexConn('sessions')
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
      knexConn.raw('COUNT("certification-candidates"."id") AS "enrolledCandidatesCount"'),
      knexConn.raw('COUNT("certification-courses"."id") AS "effectiveCandidatesCount"'),
    )
    .leftJoin('certification-candidates', 'certification-candidates.sessionId', 'sessions.id')
    .leftJoin('certification-courses', function () {
      this.on('certification-courses.userId', 'certification-candidates.userId').andOn(
        'certification-courses.sessionId',
        'certification-candidates.sessionId',
      );
    })
    .where({ certificationCenterId })
    .groupBy('sessions.id')
    .orderBy('sessions.date', 'DESC')
    .orderBy('sessions.time', 'DESC')
    .orderBy('sessions.id', 'ASC');

  const countQuery = knexConn('sessions').count('*', { as: 'row_count' }).where({ certificationCenterId });

  const { results, pagination } = await fetchPage({
    queryBuilder: query,
    paginationParams: page,
    countQueryBuilder: countQuery,
  });
  const hasSessions = Boolean(pagination.rowCount);

  const sessionSummaries = results.map((result) => SessionSummary.from(result));
  return { models: sessionSummaries, meta: { ...pagination, hasSessions } };
};

export { findPaginatedByCertificationCenterId };
