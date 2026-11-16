/**
 * Stores the data required to send the scores back to the LTI platform later. Idempotent.
 *
 * @param {object} args
 * @param {string} args.clientId
 * @param {string} args.platformUserSub
 * @param {string} args.lineItemContainerUrl AGS line items container URL
 * @param {number} args.campaignId
 * @param {typeof import('../../infrastructure/repositories/lti-campaign-participation.repository.js').ltiCampaignParticipationRepository} args.ltiCampaignParticipationRepository
 * @returns {Promise<void>}
 */
export async function saveLtiCampaignParticipation({
  clientId,
  platformUserSub,
  lineItemContainerUrl,
  campaignId,
  ltiCampaignParticipationRepository,
}) {
  await ltiCampaignParticipationRepository.save({ clientId, platformUserSub, lineItemContainerUrl, campaignId });
}
