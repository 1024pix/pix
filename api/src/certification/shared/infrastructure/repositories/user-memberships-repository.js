import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { Membership, UserMemberships } from '../../domain/read-models/UserMemberships.js';

export async function findByUserId({ userId }) {
  const knexConn = DomainTransaction.getConnection();

  const data = await knexConn
    .from('certification-center-memberships')
    .where({ userId })
    .select({
      id: 'certification-center-memberships.id',
      certificationCenterId: 'certification-center-memberships.certificationCenterId',
      userId: 'certification-center-memberships.userId',
      disabledAt: 'certification-center-memberships.disabledAt',
      role: 'certification-center-memberships.role',
      peerMembershipIds: knexConn
        .from({ peerMemberships: 'certification-center-memberships' })
        .whereRaw(
          '"peerMemberships"."certificationCenterId" = "certification-center-memberships"."certificationCenterId"',
        )
        .select(knexConn.raw(`COALESCE(ARRAY_AGG("peerMemberships".id), '{}')`)),
      invitationIds: knexConn
        .from('certification-center-invitations')
        .whereRaw(
          '"certification-center-invitations"."certificationCenterId" = "certification-center-memberships"."certificationCenterId"',
        )
        .select(knexConn.raw(`COALESCE(ARRAY_AGG("certification-center-invitations".id), '{}')`)),
    })
    .orderBy('id');

  const memberships = data.map(
    (row) =>
      new Membership({
        id: row.id,
        certificationCenterId: row.certificationCenterId,
        isDisabled: Boolean(row.disabledAt),
        isAdmin: row.role === 'ADMIN',
        peerMembershipIds: row.peerMembershipIds,
        invitationIds: row.invitationIds.map(Number),
      }),
  );

  return new UserMemberships({ userId, memberships });
}
