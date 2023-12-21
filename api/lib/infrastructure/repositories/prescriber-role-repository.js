import { knex } from '../../../db/knex-database-connection.js';
import { prescriberRoles } from '../../application/preHandlers/models/CampaignAuthorization.js';

const getForCampaign = async function ({ userId, campaignId }) {
  const result = await _getCampaignAccess({ userId, campaignId });

  if (!result) return null;

  let prescriberRole = result.organizationRole;
  if (userId === result.ownerId) {
    prescriberRole = prescriberRoles.OWNER;
  }
  return prescriberRole;
};

export { getForCampaign };

function _getCampaignAccess({ campaignId, userId }) {
  return knex('campaigns')
    .select('ownerId', 'memberships.organizationRole')
    .join('memberships', function () {
      this.on('memberships.organizationId', 'campaigns.organizationId')
        .andOnVal('userId', userId)
        .andOnVal('disabledAt', knex.raw('IS'), knex.raw('NULL'));
    })
    .where('campaigns.id', campaignId)
    .first();
}
