import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { fetchPage } from '../../../../shared/infrastructure/utils/knex-utils.js';
import { SESSION_STATUSES, SessionStatus } from '../../../shared/domain/value-objects/SessionStatus.ts';
import { SessionSummary } from '../../domain/read-models/SessionSummary.js';

export async function findPaginatedFilteredByCertificationCenterId({ certificationCenterId, filters = {}, page }) {
  const knexConn = DomainTransaction.getConnection();
  const query = knexConn
    .with('session_data', (qb) => {
      qb.from('sessions')
        .select({
          id: 'sessions.id',
          address: 'sessions.address',
          room: 'sessions.room',
          date: 'sessions.date',
          time: 'sessions.time',
          examiner: 'sessions.examiner',
          createdAt: 'sessions.createdAt',
          finalizedAt: 'sessions.finalizedAt',
          publishedAt: 'sessions.publishedAt',
          assignedCertificationOfficerId: 'sessions.assignedCertificationOfficerId',
          enrolledCandidatesCount: knexConn('certification-candidates')
            .count('id')
            .whereRaw('?? = ??', ['certification-candidates.sessionId', 'sessions.id']),
          effectiveCandidatesCount: knexConn('certification-courses')
            .count('id')
            .whereRaw('?? = ??', ['certification-courses.sessionId', 'sessions.id']),
          firstCertificationStartedAt: knexConn('certification-courses')
            .select('createdAt')
            .whereRaw('?? = ??', ['certification-courses.sessionId', 'sessions.id'])
            .orderBy('createdAt', 'asc')
            .first(),
        })
        .where({ certificationCenterId });
    })
    .select('*')
    .from('session_data')
    .modify(_setupFilters, filters)
    .orderBy('session_data.date', 'DESC')
    .orderBy('session_data.time', 'DESC')
    .orderBy('session_data.id', 'ASC');

  const { results, pagination } = await fetchPage({
    queryBuilder: query,
    paginationParams: page,
  });

  const hasSessions = Boolean(await knexConn('sessions').select('id').where({ certificationCenterId }).first());
  const sessionSummaries = results.map((result) => {
    const sessionStatus = SessionStatus.build(result);
    return new SessionSummary({ ...result, sessionStatus });
  });
  return { models: sessionSummaries, meta: { ...pagination, hasSessions } };
}

function _setupFilters(query, filters) {
  const { sessionId, status, startDate, endDate } = filters;

  if (sessionId) {
    query.where('session_data.id', sessionId);
  }

  if (status === SESSION_STATUSES.CREATED) {
    query.whereNull('finalizedAt');
    query.whereNull('publishedAt');
    query.where((qb) => {
      qb.orWhereNull('firstCertificationStartedAt');
      qb.orWhereRaw(`LOCALTIMESTAMP < "firstCertificationStartedAt" + INTERVAL '1 day'`);
    });
  }
  if (status === SESSION_STATUSES.TO_FINALIZE) {
    query.whereNull('finalizedAt');
    query.whereNull('publishedAt');
    query.whereNotNull('firstCertificationStartedAt');
    query.whereRaw(`LOCALTIMESTAMP >= "firstCertificationStartedAt" + INTERVAL '1 day'`);
  }
  if (status === SESSION_STATUSES.FINALIZED) {
    query.whereNotNull('finalizedAt');
    query.whereNull('publishedAt');
  }
  if (status === SESSION_STATUSES.PROCESSED) {
    query.whereNotNull('publishedAt');
  }

  if (startDate) {
    query.where('session_data.date', '>=', startDate);
  }

  if (endDate) {
    query.where('session_data.date', '<=', endDate);
  }
}
