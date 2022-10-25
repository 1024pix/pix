const { knex } = require('../../../db/knex-database-connection');
const CertificationCenterInvitedUser = require('../../domain/models/CertificationCenterInvitedUser');
const { NotFoundError } = require('../../domain/errors');

module.exports = {
  async get({ certificationCenterInvitationId, email }) {
    const invitation = await knex('certification-center-invitations')
      .select('id', 'certificationCenterId', 'code', 'status')
      .where({ id: certificationCenterInvitationId })
      .first();
    if (!invitation) {
      throw new NotFoundError(`Not found certification center invitation for ID ${certificationCenterInvitationId}`);
    }

    const user = await knex('users').select('id').where({ email }).first();
    if (!user) {
      throw new NotFoundError(`Not found user for email ${email}`);
    }

    return new CertificationCenterInvitedUser({
      userId: user.id,
      invitation,
      status: invitation.status,
    });
  },
};
