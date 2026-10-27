import { CERTIFICATION_CENTER_TYPES, ORGANIZATION_TYPES } from '../../../../shared/constants.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { SessionStatus } from '../../../shared/domain/value-objects/SessionStatus.ts';
import { SessionAuthorizationInfo } from '../../domain/models/SessionAuthorizationInfo.js';

export async function findBySessionId({ sessionId }) {
  const knexConn = DomainTransaction.getConnection();
  const sessionAuthorizationData = await knexConn
    .select({
      id: 'sessions.id',
      finalizedAt: 'sessions.finalizedAt',
      publishedAt: 'sessions.publishedAt',
      invigilatorPassword: 'sessions.invigilatorPassword',
      certificationCenterId: 'sessions.certificationCenterId',
      assignedCertificationOfficerId: 'sessions.assignedCertificationOfficerId',
      certificationCenterArchived: knexConn.raw(
        '("certification-centers"."archivedBy" IS NOT NULL OR "certification-centers"."archivedAt" IS NOT NULL)',
      ),
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
    .join('certification-centers', 'certification-centers.id', 'sessions.certificationCenterId')
    .where('sessions.id', sessionId)
    .first();

  if (!sessionAuthorizationData) {
    return null;
  }
  const sessionStatus = SessionStatus.build(sessionAuthorizationData);

  return new SessionAuthorizationInfo({ ...sessionAuthorizationData, sessionStatus });
}
