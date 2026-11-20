import { LtiCampaignNotFoundError } from '../errors.js';

/**
 * Starts a campaign launched from an LTI platform: retrieves the campaign, initializes its line items
 * on the platform, then stores the data required to send the scores back to the platform later (idempotent).
 *
 * @param {object} args
 * @param {number} args.campaignId
 * @param {string} args.lineItemsUrl AGS line items container URL
 * @param {string} args.resourceLinkId LTI resource link id
 * @param {{ token_type: string, access_token: string }} args.accessToken AGS access token, scoped for line items
 * @param {string} args.clientId client id of the platform registration
 * @param {string} args.platformUserSub user id on the platform
 * @param {typeof import('../../infrastructure/repositories/lti-campaign.repository.js').ltiCampaignRepository} args.ltiCampaignRepository
 * @param {typeof import('../../infrastructure/repositories/lti-campaign-participation.repository.js').ltiCampaignParticipationRepository} args.ltiCampaignParticipationRepository
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
  clientId,
  platformUserSub,
  ltiCampaignRepository,
  ltiCampaignParticipationRepository,
  ltiScoringService,
}) {
  const campaign = Number.isInteger(campaignId) ? await ltiCampaignRepository.getLtiCampaign({ campaignId }) : null;

  if (!campaign) {
    throw new LtiCampaignNotFoundError();
  }

  await ltiScoringService.initializeLineItems({ lineItemsUrl, resourceLinkId, campaign, accessToken });

  await ltiCampaignParticipationRepository.save({
    clientId,
    platformUserSub,
    lineItemContainerUrl: lineItemsUrl,
    campaignId: campaign.id,
  });

  return campaign;
}
