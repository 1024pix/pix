import { CampaignParticipationResult } from '../../domain/models/CampaignParticipationResult.js';
/**
 * @typedef {typeof import('../../../prescription/campaign-participation/application/api/campaign-participations-api.js')} CampaignParticipationApi
 */
export const ltiCampaignParticipationRepository = {
  /**
   * @param {Object} params
   * @param {number} params.campaignParticipationId
   * @param {string} [params.locale]
   * @param {CampaignParticipationApi} params.campaignParticipationsApi
   * @returns {Promise<CampaignParticipationResult>}
   */
  async getCampaignParticipationResult({ campaignParticipationId, locale, campaignParticipationsApi }) {
    const result = await campaignParticipationsApi.getCampaignParticipationResult({ campaignParticipationId, locale });

    return new CampaignParticipationResult({
      campaignParticipationId: result.id,
      masteryRate: result.masteryRate,
      pixScore: result.pixScore,
      competences: result.levelsPerCompetence.map((competence) => ({
        id: competence.id,
        index: competence.index,
        name: competence.name,
        maxLevel: competence.maxLevel,
        reachedLevel: competence.meanLevel,
      })),
    });
  },
};
