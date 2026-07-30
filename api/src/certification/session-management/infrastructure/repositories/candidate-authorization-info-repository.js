import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CandidateAuthorizationInfo } from '../../domain/read-models/CandidateAuthorizationInfo.js';

export async function findByUserIdAndSessionId({ userId, sessionId }) {
  const knexConn = DomainTransaction.getConnection();
  const candidateAuthorizationData = await knexConn
    .from('certification-candidates')
    .join('sessions', 'sessions.id', 'certification-candidates.sessionId')
    .join('certification-centers', 'certification-centers.id', 'sessions.certificationCenterId')
    .leftJoin('certification-courses', 'certification-courses.candidateId', 'certification-candidates.id')
    .leftJoin(
      'complementary-certification-habilitations',
      'complementary-certification-habilitations.certificationCenterId',
      'certification-centers.id',
    )
    .leftJoin(
      'complementary-certifications',
      'complementary-certifications.id',
      'complementary-certification-habilitations.complementaryCertificationId',
    )
    .where('certification-candidates.userId', userId)
    .where('certification-candidates.sessionId', sessionId)
    .select({
      id: 'certification-candidates.id',
      reconciledUserId: 'certification-candidates.userId',
      reconciledAt: 'certification-candidates.reconciledAt',
      subscription: 'certification-candidates.subscription',
      authorizedToStartAt: 'certification-candidates.authorizedToStartAt',
      sessionId: 'sessions.id',
      sessionAccessCode: 'sessions.accessCode',
      sessionFinalizedAt: 'sessions.finalizedAt',
      sessionPublishedAt: 'sessions.publishedAt',
      certificationId: 'certification-courses.id',
      certificationStartedAt: 'certification-courses.createdAt',
      centerHabilitations: knexConn.raw(
        `array_agg("complementary-certifications"."key" ORDER BY "complementary-certifications".key)`,
      ),
    })
    .groupBy(
      'certification-candidates.id',
      'certification-candidates.userId',
      'certification-candidates.authorizedToStartAt',
      'certification-candidates.reconciledAt',
      'certification-candidates.subscription',
      'sessions.id',
      'sessions.accessCode',
      'sessions.finalizedAt',
      'sessions.publishedAt',
      'certification-courses.id',
      'certification-courses.createdAt',
    )
    .first();

  if (!candidateAuthorizationData) {
    return null;
  }
  candidateAuthorizationData.centerHabilitations = candidateAuthorizationData?.centerHabilitations ?? [];
  candidateAuthorizationData.centerHabilitations = Object.fromEntries(
    candidateAuthorizationData.centerHabilitations.map((key) => [key, true]),
  );

  return new CandidateAuthorizationInfo(candidateAuthorizationData);
}
