import { LtiCampaignNotFoundError, LtiLineItemsInitializationError } from '../errors.js';

const LINE_ITEM_SCOPE = 'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem';
const LINE_ITEMS_LOCALE = 'fr';

/**
 * Starts a campaign launched from an LTI platform: retrieves the campaign, initializes its line items
 * on the platform, then stores the data required to send the scores back to the platform later (idempotent).
 *
 * @param {object} args
 * @param {number} args.campaignId
 * @param {string} args.lineItemsUrl AGS line items container URL
 * @param {string} args.resourceLinkId LTI resource link id
 * @param {import('../models/LtiPlatformRegistration.js').LtiPlatformRegistration} args.registration registration of the platform the campaign is launched from
 * @param {string} args.platformUserSub user id on the platform
 * @param {typeof import('../../infrastructure/repositories/lti-campaign.repository.js').ltiCampaignRepository} args.ltiCampaignRepository
 * @param {typeof import('../../infrastructure/repositories/lti-campaign-participation.repository.js').ltiCampaignParticipationRepository} args.ltiCampaignParticipationRepository
 * @param {typeof import('../services/lti.service.js').ltiService} args.ltiService
 * @param {typeof import('../services/lti.scoring.service.js').ltiScoringService} args.ltiScoringService
 * @param {(locale: string) => { __: (key: string) => string }} args.getI18n
 * @returns {Promise<import('../models/LtiCampaign.js').LtiCampaign>}
 * @throws {LtiCampaignNotFoundError}
 * @throws {LtiLineItemsInitializationError}
 */
export async function startLtiCampaign({
  campaignId,
  lineItemsUrl,
  resourceLinkId,
  registration,
  platformUserSub,
  ltiCampaignRepository,
  ltiCampaignParticipationRepository,
  ltiService,
  ltiScoringService,
  getI18n,
}) {
  const campaign = Number.isInteger(campaignId) ? await ltiCampaignRepository.getLtiCampaign({ campaignId }) : null;

  if (!campaign) {
    throw new LtiCampaignNotFoundError();
  }

  const accessToken = await ltiService.getAccessToken({ scope: LINE_ITEM_SCOPE, registration });
  if (!accessToken) {
    throw new LtiLineItemsInitializationError('Could not get access token to initialize line items');
  }

  await ltiScoringService.initializeLineItems({
    lineItemsUrl,
    resourceLinkId,
    tag: campaign.lineItemTag,
    lineItems: campaign.buildLineItems(resourceLinkId, getI18n(LINE_ITEMS_LOCALE)),
    accessToken,
  });

  await ltiCampaignParticipationRepository.save({
    clientId: registration.clientId,
    platformUserSub,
    lineItemContainerUrl: lineItemsUrl,
    campaignId: campaign.id,
  });

  return campaign;
}
