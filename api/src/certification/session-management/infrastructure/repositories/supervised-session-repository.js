import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { SupervisedSession } from '../../domain/models/SupervisedSession.js';

export async function findById({ id }) {
  const knexConn = DomainTransaction.getConnection();
  const supervisedSessionData = await knexConn
    .from('sessions')
    .where('sessions.id', id)
    .select({
      id: 'sessions.id',
      date: 'sessions.date',
      firstStartedCertificationId: knexConn.raw(`
      (
        SELECT "certification-courses".id
        FROM "certification-courses"
        WHERE "certification-courses"."sessionId" = sessions.id
        ORDER BY "certification-courses"."createdAt" ASC
        LIMIT 1
      )
    `),
    })
    .first();

  if (!supervisedSessionData) {
    return null;
  }

  return new SupervisedSession(supervisedSessionData);
}

export async function update(supervisedSession) {
  const knexConn = DomainTransaction.getConnection();

  await knexConn('sessions').update({ date: supervisedSession.date }).where('sessions.id', supervisedSession.id);
}
