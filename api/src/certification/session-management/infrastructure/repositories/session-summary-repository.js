import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { fetchPage } from '../../../../shared/infrastructure/utils/knex-utils.js';
import { SESSION_STATUSES } from '../../../shared/domain/constants.js';
import { SessionSummary } from '../../domain/read-models/SessionSummary.js';

export async function findPaginatedFilteredByCertificationCenterId({ certificationCenterId, filters = {}, page }) {
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
      enrolledCandidatesCount: knexConn('certification-candidates')
        .count('id')
        .whereRaw('?? = ??', ['certification-candidates.sessionId', 'sessions.id']),
      effectiveCandidatesCount: knexConn('certification-courses')
        .count('id')
        .whereRaw('?? = ??', ['certification-courses.sessionId', 'sessions.id']),
    })
    .where({ certificationCenterId })
    .modify(_setupFilters, filters)
    .orderBy('sessions.date', 'DESC')
    .orderBy('sessions.time', 'DESC')
    .orderBy('sessions.id', 'ASC');

  const { results, pagination } = await fetchPage({
    queryBuilder: query,
    paginationParams: page,
  });

  const hasSessions = Boolean(await knexConn('sessions').select('id').where({ certificationCenterId }).first());
  const sessionSummaries = results.map((result) => SessionSummary.from(result));
  return { models: sessionSummaries, meta: { ...pagination, hasSessions } };
}

function _setupFilters(query, filters) {
  const { sessionId, status, startDate, endDate } = filters;

  if (sessionId) {
    query.where('sessions.id', sessionId);
  }

  if (status === SESSION_STATUSES.CREATED) {
    query.whereNull('finalizedAt');
    query.whereNull('publishedAt');
  }
  if (status === SESSION_STATUSES.FINALIZED) {
    query.whereNotNull('finalizedAt');
    query.whereNull('publishedAt');
  }
  if (status === SESSION_STATUSES.PROCESSED) {
    query.whereNotNull('publishedAt');
  }

  if (startDate) {
    query.where('sessions.date', '>=', startDate);
  }

  if (endDate) {
    query.where('sessions.date', '<=', endDate);
  }
}
