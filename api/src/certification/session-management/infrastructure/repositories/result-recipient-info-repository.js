import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { ResultRecipientInfo } from '../../domain/read-models/ResultRecipientInfo.ts';

export async function findBySessionId({ sessionId }) {
  const knexConn = DomainTransaction.getConnection();
  const resultRecipientData = await knexConn
    .select({
      id: 'sessions.id',
      sessionDate: 'sessions.date',
      certificationCenter: 'certification-centers.name',
      emails: knexConn.raw(`ARRAY_AGG(? ORDER BY ?)`, [
        'certification-candidates.resultRecipientEmail',
        'certification-candidates.id',
      ]),
    })
    .from('certification-centers')
    .join('sessions', 'sessions.certificationCenterId', 'certification-centers.id')
    .join('certification-candidates', 'certification-candidates.sessionId', 'sessions.id')
    .join('certification-courses', 'certification-courses.candidateId', 'certification-candidates.id')
    .where('sessions.id', sessionId)
    .groupBy('sessions.id', 'sessions.date', 'certification-centers.name')
    .first();

  if (!resultRecipientData) {
    return null;
  }

  const emailsForClea = knexConn
    .pluck('users.email')
    .from('certification-centers')
    .join(
      'certification-center-memberships',
      'certification-center-memberships.certificationCenterId',
      'certification-centers.id',
    )
    .join('users', 'users.id', 'certification-center-memberships.userId')
    .join('sessions', 'sessions.certificationCenterId', 'certification-centers.id')
    .where('sessions.id', sessionId)
    .where('certification-center-memberships.isReferer', true)
    .orderBy('users.id');

  return new ResultRecipientInfo({
    ...resultRecipientData,
    emails: resultRecipientData.emails ?? [],
    emailsForClea,
  });
}
