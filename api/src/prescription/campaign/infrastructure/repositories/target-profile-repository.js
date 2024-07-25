import { knex } from '../../../../../db/knex-database-connection.js';
import { Badge } from '../../../../evaluation/domain/models/Badge.js';
import { TargetProfile } from '../../../../shared/domain/models/index.js';

const getByCampaignId = async function (campaignId) {
  const { targetProfileId } = await knex('campaigns').select('targetProfileId').where({ id: campaignId }).first();

  const targetProfile = await knex('target-profiles').where({ id: targetProfileId }).first();
  const badges = await knex('badges').where('targetProfileId', targetProfileId);

  return new TargetProfile({ ...targetProfile, badges: badges.map((badge) => new Badge(badge)) });
};

export { getByCampaignId };
