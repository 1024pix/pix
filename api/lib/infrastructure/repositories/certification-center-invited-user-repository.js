import { knex } from '../../../db/knex-database-connection';
import CertificationCenterInvitedUser from '../../domain/models/CertificationCenterInvitedUser';
import { NotFoundError } from '../../domain/errors';

export default {
  async get({ certificationCenterInvitationId, email }) {
    const invitation = await knex('certification-center-invitations')
      .select('id', 'certificationCenterId', 'code', 'status')
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
    });
  },

  async save(certificationCenterInvitedUser) {
    await knex('certification-center-memberships').insert({
      certificationCenterId: certificationCenterInvitedUser.invitation.certificationCenterId,
      userId: certificationCenterInvitedUser.userId,
    });

    await knex('certification-center-invitations')
      .update({ status: certificationCenterInvitedUser.status, updatedAt: new Date() })
      .where({ id: certificationCenterInvitedUser.invitation.id });
  },
};
