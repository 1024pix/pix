import { child, SCOPES } from '../../../shared/infrastructure/utils/logger.js';
import { LtiScoreSendingError } from '../errors.js';

const logger = child('lti:send-campaign-participation-result', { event: SCOPES.LTI });

// line items scope is needed to look the line items up, score scope to publish scores on them
const SCORE_SCOPES = [
  'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem',
  'https://purl.imsglobal.org/spec/lti-ags/scope/score',
].join(' ');

/**
 * Sends the result of a shared campaign participation to the LTI platform the user launched the campaign from:
 * one score per line item of the campaign.
 *
 * @param {object} args
 * @param {number} args.campaignId
 * @param {number} args.campaignParticipationId
 * @param {number} args.userId
 * @param {Date} args.sharedAt date of the participation sharing, used as score timestamp
 * @param {typeof import('../../infrastructure/repositories/lti-campaign.repository.js').ltiCampaignRepository} args.ltiCampaignRepository
 * @param {typeof import('../../infrastructure/repositories/lti-campaign-participation.repository.js').ltiCampaignParticipationRepository} args.ltiCampaignParticipationRepository
 * @param {typeof import('../../infrastructure/repositories/lti-launch-context.repository.js').ltiLaunchContextRepository} args.ltiLaunchContextRepository
 * @param {typeof import('../services/lti.service.js').ltiService} args.ltiService
 * @param {typeof import('../services/lti.scoring.service.js').ltiScoringService} args.ltiScoringService
 * @returns {Promise<void>}
 * @throws {LtiScoreSendingError}
 */
export async function sendCampaignParticipationResult({
  campaignId,
  campaignParticipationId,
  userId,
  sharedAt,
  ltiCampaignRepository,
  ltiCampaignParticipationRepository,
  ltiLaunchContextRepository,
  ltiService,
  ltiScoringService,
}) {
  const ltiLaunchContext = await ltiLaunchContextRepository.findByCampaignIdAndUserId({ campaignId, userId });
  if (!ltiLaunchContext) {
    logger.info({ campaignId, campaignParticipationId }, 'participation not launched through LTI, no result sent');
    return;
  }

  const { registration, lineItemsUrl, resourceLinkId, ltiUserId } = ltiLaunchContext;

  const campaign = await ltiCampaignRepository.getLtiCampaign({ campaignId });
  const campaignParticipationResult = await ltiCampaignParticipationRepository.getCampaignParticipationResult({
    campaignParticipationId,
  });

  const accessToken = await ltiService.getAccessToken({ scope: SCORE_SCOPES, registration });
  if (!accessToken) {
    throw new LtiScoreSendingError('Could not get access token to send scores');
  }

  await ltiScoringService.sendScores({
    lineItemsUrl,
    resourceLinkId,
    tag: campaign.lineItemTag,
    ltiUserId,
    scores: campaign.buildLineItemScores(campaignParticipationResult),
    timestamp: sharedAt,
    accessToken,
  });
}
