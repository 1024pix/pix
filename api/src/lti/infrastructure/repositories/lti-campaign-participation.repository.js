import { CampaignAssessmentResult } from '../../domain/models/CampaignAssessmentResult.js';

export const ltiCampaignParticipationRepository = {
  /**
   * @param {Object} params
   * @param {number} params.campaignParticipationId
   * @param {string} [params.locale]
   * @returns {Promise<CampaignAssessmentResult>}
   */
  async getAssessmentCampaignResult({ campaignParticipationId, locale, campaignParticipationsApi }) {
    const result = await campaignParticipationsApi.getAssessmentCampaignResult({ campaignParticipationId, locale });

    return new CampaignAssessmentResult({
      campaignParticipationId: result.id,
      masteryRate: result.masteryRate,
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
