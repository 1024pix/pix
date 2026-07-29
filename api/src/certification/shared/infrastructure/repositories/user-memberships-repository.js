import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { Membership, UserMemberships } from '../../domain/read-models/UserMemberships.js';

export async function findByUserId({ userId }) {
  const knexConn = DomainTransaction.getConnection();

  const data = await knexConn
    .from('certification-center-memberships')
    .where({ userId })
    .select({
      certificationCenterId: 'certification-center-memberships.certificationCenterId',
      userId: 'certification-center-memberships.userId',
      disabledAt: 'certification-center-memberships.disabledAt',
    })
    .orderBy('id');

  const memberships = data.map(
    (row) =>
      new Membership({
        certificationCenterId: row.certificationCenterId,
        isDisabled: Boolean(row.disabledAt),
      }),
  );

  return new UserMemberships({ userId, memberships });
}
