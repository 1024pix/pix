import { CERTIFICATION_CENTER_TYPES, ORGANIZATION_TYPES } from '../../../../shared/constants.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { SessionAuthorizationInfo } from '../../domain/read-models/SessionAuthorizationInfo.js';

export async function findBySessionId({ sessionId }) {
  const knexConn = DomainTransaction.getConnection();
  const sessionAuthorizationData = await knexConn
    .select({
      id: 'sessions.id',
      finalizedAt: 'sessions.finalizedAt',
      certificationCenterId: 'sessions.certificationCenterId',
      firstCertificationStartedAt: knexConn
        .select('createdAt')
        .from('certification-courses')
        .where('certification-courses.sessionId', sessionId)
        .orderBy('createdAt', 'asc')
        .first(),
      scoIsManagingStudentsOrganizationId: knexConn
        .select('organizations.id')
        .from('certification-centers')
        .leftJoin(
          'organizations',
          knexConn.raw('LOWER("certification-centers"."externalId")'),
          knexConn.raw('LOWER("organizations"."externalId")'),
        )
        .whereRaw('"sessions"."certificationCenterId" = "certification-centers".id')
        .where({
          'certification-centers.type': CERTIFICATION_CENTER_TYPES.SCO,
          'organizations.type': ORGANIZATION_TYPES.SCO,
          'organizations.archivedAt': null,
          'organizations.isManagingStudents': true,
        })
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
