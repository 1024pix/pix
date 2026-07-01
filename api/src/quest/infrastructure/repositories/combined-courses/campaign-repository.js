import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { Campaign } from '../../../domain/models/combined-courses/entities/Campaign.js';

export const getByCode = async function ({ code, campaignsApi }) {
  const campaign = await campaignsApi.getByCode(code);
  return new Campaign(campaign);
};

export const get = async function ({ id, campaignsApi }) {
  const campaign = await campaignsApi.get(id);
  return new Campaign(campaign);
};

export const deleteCampaignsInCombinedCourses = async function ({
  userId,
  organizationId,
  campaignIds,
  keepPreviousDeletion,
  userRole,
  client,
  campaignsApi,
}) {
  return campaignsApi.deleteCampaignsInCombinedCourses({
    userId,
    organizationId,
    campaignIds,
    keepPreviousDeletion,
    userRole,
    client,
  });
};

export const getCampaignIdsByCombinedCourseIds = async function ({ combinedCourseIds }) {
  const knexConn = DomainTransaction.getConnection();

  const successRequirements = await knexConn
    .select('quests.successRequirements')
    .from('combined_courses')
    .join('quests', 'quests.id', 'combined_courses.questId')
    .whereIn('combined_courses.id', combinedCourseIds)
    .pluck('quests.successRequirements');

  const campaignIds = successRequirements
    .flat()
    .filter((requirement) => requirement.data.campaignId)
    .map((requirement) => parseInt(requirement.data.campaignId.data));

  return campaignIds;
};

export const save = async function ({ campaigns, campaignsApi }) {
  const campaignToCreate = campaigns.map(_toDTO);
  const createdCampaigns = await campaignsApi.save(campaignToCreate, {
    allowCreationWithoutTargetProfileShare: true,
  });
  return createdCampaigns.map((campaign) => new Campaign(campaign));
};

const _toDTO = (campaign) => {
  return {
    ...campaign,
    type: 'ASSESSMENT',
    multipleSendings: false,
  };
};
