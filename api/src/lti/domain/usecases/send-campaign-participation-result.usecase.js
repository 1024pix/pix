import { child, SCOPES } from '../../../shared/infrastructure/utils/logger.js';

const logger = child('lti:send-campaign-participation-result', { event: SCOPES.LTI });

/**
 * @param {object} args
 * @param {number} args.campaignId
 * @param {number} args.campaignParticipationId
 * @param {number} args.userId
 * @param {typeof import('../../infrastructure/repositories/lti-campaign-participation.repository.js').ltiCampaignParticipationRepository} args.ltiCampaignParticipationRepository
 * @returns {Promise<import('../models/CampaignParticipationResult.js').CampaignParticipationResult>}
 */
export async function sendCampaignParticipationResult({
  campaignId,
  campaignParticipationId,
  userId,
  ltiCampaignParticipationRepository,
}) {
  logger.info({ campaignId, campaignParticipationId, userId }, 'sending campaign participation result');

  // TODO: retrieve the LTI context of the participation before fetching its result, i.e. for this user and campaign:
  //  - the LTI platform (and its registration) the user was launched from, to get an AGS access token
  //  - the line items URL and resource link id received at launch
  //  - the LTI user id (`sub` claim) to send the score for
  // This data is not stored yet: it must be persisted during the LTI launch.
  // Campaigns not launched through LTI should be skipped here.

  const campaignParticipationResult = await ltiCampaignParticipationRepository.getCampaignParticipationResult({
    campaignParticipationId,
  });

  // TODO: send the campaign participation result to the LTI platform

  return campaignParticipationResult;
}
