/**
 * @param {object} args
 * @param {number} args.campaignId
 * @param {typeof import('../../infrastructure/repositories/lti-campaign.repository.js').ltiCampaignRepository} args.ltiCampaignRepository
 * @returns {Promise<import('../models/LtiCampaign.js').LtiCampaign|null>} null when the campaign does not exist
 */
export async function getLtiCampaign({ campaignId, ltiCampaignRepository }) {
  return ltiCampaignRepository.getLtiCampaign({ campaignId });
}
