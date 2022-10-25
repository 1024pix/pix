const { knex } = require('../../../db/knex-database-connection');
const { NotFoundError } = require('../../domain/errors');

module.exports = {
  async get({ certificationCenterInvitationId }) {
    const invitation = await knex('certification-center-invitations')
      .select('id', 'certificationCenterId', 'code', 'status')
      .where({ id: certificationCenterInvitationId })
      .first();
    if (!invitation) {
      throw new NotFoundError(`Not found certification center invitation for ID ${certificationCenterInvitationId}`);
    }

    return invitation;
  },
};
