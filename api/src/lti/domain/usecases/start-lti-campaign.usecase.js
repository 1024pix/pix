import { LtiCampaignNotFoundError } from '../errors.js';

/**
 * Starts a campaign launched from an LTI platform: retrieves the campaign
 * and initializes its line items on the platform.
 *
 * @param {object} args
 * @param {number} args.campaignId
 * @param {string} args.lineItemsUrl AGS line items container URL
 * @param {string} args.resourceLinkId LTI resource link id
 * @param {{ token_type: string, access_token: string }} args.accessToken AGS access token, scoped for line items
 * @param {typeof import('../../infrastructure/repositories/lti-campaign.repository.js').ltiCampaignRepository} args.ltiCampaignRepository
 * @param {typeof import('../services/lti.scoring.service.js').ltiScoringService} args.ltiScoringService
 * @returns {Promise<import('../models/LtiCampaign.js').LtiCampaign>}
 * @throws {LtiCampaignNotFoundError}
 * @throws {import('../errors.js').LtiLineItemsInitializationError}
 */
export async function startLtiCampaign({
  campaignId,
  lineItemsUrl,
  resourceLinkId,
  accessToken,
  ltiCampaignRepository,
  ltiScoringService,
}) {
  const campaign = Number.isInteger(campaignId) ? await ltiCampaignRepository.getLtiCampaign({ campaignId }) : null;

  if (!campaign) {
    throw new LtiCampaignNotFoundError();
  }

  await ltiScoringService.initializeLineItems({ lineItemsUrl, resourceLinkId, campaign, accessToken });

  return campaign;
}
