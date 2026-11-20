import { LtiCampaignNotFoundError, LtiLineItemsInitializationError } from '../errors.js';

const LINE_ITEM_SCOPE = 'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem';
const LINE_ITEMS_LOCALE = 'fr';

/**
 * Starts a campaign launched from an LTI platform: retrieves the campaign
 * and initializes its line items on the platform.
 *
 * @param {object} args
 * @param {number} args.campaignId
 * @param {string} args.lineItemsUrl AGS line items container URL
 * @param {string} args.resourceLinkId LTI resource link id
 * @param {import('../models/LtiPlatformRegistration.js').LtiPlatformRegistration} args.registration registration of the platform the campaign is launched from
 * @param {typeof import('../../infrastructure/repositories/lti-campaign.repository.js').ltiCampaignRepository} args.ltiCampaignRepository
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
  ltiCampaignRepository,
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

  return campaign;
}
