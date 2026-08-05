import { Badge } from '../../../../evaluation/domain/models/Badge.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { TargetProfile } from '../../../../shared/domain/models/TargetProfile.js';
import * as targetProfileApi from '../../../target-profile/application/api/target-profile-api.js';

const getByCampaignId = async function ({ campaignId }) {
  const knexConn = DomainTransaction.getConnection();

  const { targetProfileId } = await knexConn('campaigns').select('targetProfileId').where({ id: campaignId }).first();

  const targetProfile = await targetProfileApi.getById(targetProfileId);

  const badges = await knexConn('badges').where('targetProfileId', targetProfileId);

  return new TargetProfile({ ...targetProfile, badges: badges.map((badge) => new Badge(badge)) });
};

export { getByCampaignId };
