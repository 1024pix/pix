import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { SessionAuthorizationInfo } from '../../domain/read-models/SessionAuthorizationInfo.js';

export async function findBySessionId({ sessionId }) {
  const knexConn = DomainTransaction.getConnection();
  const sessionAuthorizationData = await knexConn
    .select({
      id: 'sessions.id',
      finalizedAt: 'sessions.finalizedAt',
      firstCertificationStartedAt: knexConn
        .select('createdAt')
        .from('certification-courses')
        .where('certification-courses.sessionId', sessionId)
        .orderBy('createdAt', 'asc')
        .first(),
    })
    .from('sessions')
    .where('sessions.id', sessionId)
    .first();

  if (!sessionAuthorizationData) {
    return null;
  }

  return new SessionAuthorizationInfo(sessionAuthorizationData);
}
