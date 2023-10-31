import { knex } from '../../../db/knex-database-connection.js';
import { CertificationCenterInvitedUser } from '../../domain/models/CertificationCenterInvitedUser.js';
import { NotFoundError } from '../../domain/errors.js';

const get = async function ({ certificationCenterInvitationId, email }) {
  const invitation = await knex('certification-center-invitations')
    .select('id', 'certificationCenterId', 'code', 'status', 'role')
    .where({ id: certificationCenterInvitationId })
    .first();
  if (!invitation) {
    throw new NotFoundError(`No certification center invitation found for ID ${certificationCenterInvitationId}`);
  }

  const user = await knex('users').select('id').where({ email }).first();
  if (!user) {
    throw new NotFoundError(`No user found for email ${email} for this certification center invitation`);
  }

  return new CertificationCenterInvitedUser({
    userId: user.id,
    invitation,
    status: invitation.status,
    role: invitation.role,
  });
};

const save = async function (certificationCenterInvitedUser) {
  await knex('certification-center-memberships').insert({
    certificationCenterId: certificationCenterInvitedUser.invitation.certificationCenterId,
    userId: certificationCenterInvitedUser.userId,
  });

  await knex('certification-center-invitations')
    .update({ status: certificationCenterInvitedUser.status, updatedAt: new Date() })
    .where({ id: certificationCenterInvitedUser.invitation.id });
};

export { get, save };
