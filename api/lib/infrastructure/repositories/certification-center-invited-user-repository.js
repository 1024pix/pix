const { knex } = require('../../../db/knex-database-connection');
const { NotFoundError } = require('../../domain/errors');

module.exports = {
  async get({ certificationCenterInvitationId, email }) {
    const invitation = await knex('certification-center-invitations')
      .select('id', 'certificationCenterId', 'code', 'status')
      .where({ id: certificationCenterInvitationId })
      .first();
    if (!invitation) {
      throw new NotFoundError(`No certification center invitation found for ID ${certificationCenterInvitationId}`);
    }

    const userId = await knex('users').select('id').where({ email }).first();
    if (!userId) {
      throw new NotFoundError(`No user found for email ${email}`);
    }

    return { invitation, userId };
  },
};
