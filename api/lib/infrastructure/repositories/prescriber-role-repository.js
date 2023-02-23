const { NotFoundError } = require('../../domain/errors.js');
const { knex } = require('../../../db/knex-database-connection.js');
const CampaignAuthorization = require('../../application/preHandlers/models/CampaignAuthorization.js');

module.exports = {
  async getForCampaign({ userId, campaignId }) {
    const { organizationId, ownerId } = await _getOrganizationIdAndOwnerId({ campaignId });
    const organizationRole = await _getOrganizationRole({ userId, organizationId });

    let prescriberRole = organizationRole;
    if (userId === ownerId) {
      prescriberRole = CampaignAuthorization.prescriberRoles.OWNER;
    }
    return prescriberRole;
  },
};

async function _getOrganizationIdAndOwnerId({ campaignId }) {
  const result = await knex('campaigns').select('organizationId', 'ownerId').where({ id: campaignId }).first();
  if (!result) {
    throw new NotFoundError('Campaign is not found');
  }
  return result;
}

async function _getOrganizationRole({ userId, organizationId }) {
  const result = await knex('memberships')
    .select('organizationRole')
    .where({ userId, organizationId, disabledAt: null })
    .first();
  if (!result) {
    throw new NotFoundError('Membership is not found');
  }
  return result.organizationRole;
}
