import { type Knex } from 'knex';

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { Session } from '../../domain/models/Session.ts';

type SessionRows = {
  certificationId: number;
};

export async function get(sessionId: number) {
  const knexConn: Knex = DomainTransaction.getConnection();
  const sessionData: Array<SessionRows> = await knexConn<Array<SessionRows>>('certification-courses')
    .select({
      certificationId: 'certification-courses.id',
    })
    .where('sessionId', sessionId)
    .orderBy('certification-courses.id');

  if (!sessionData.length) {
    return null;
  }

  return new Session({
    id: sessionId,
    certificationIds: sessionData.map(({ certificationId }) => certificationId),
  });
}
