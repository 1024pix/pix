import { knex } from '../../../../../db/knex-database-connection.js';
import { TargetProfile } from '../../../../../lib/domain/models/index.js';
import { Badge } from '../../../../shared/domain/models/Badge.js';

const getByCampaignId = async function (campaignId) {
  const { targetProfileId } = await knex('campaigns').select('targetProfileId').where({ id: campaignId }).first();

  const targetProfile = await knex('target-profiles').where({ id: targetProfileId }).first();
  const badges = await knex('badges').where('targetProfileId', targetProfileId);

  return new TargetProfile({ ...targetProfile, badges: badges.map((badge) => new Badge(badge)) });
};

export { getByCampaignId };
