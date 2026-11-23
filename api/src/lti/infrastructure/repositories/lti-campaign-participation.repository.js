import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { CampaignParticipationResult } from '../../domain/models/CampaignParticipationResult.js';
/**
 * @typedef {typeof import('../../../prescription/campaign-participation/application/api/campaign-participations-api.js')} CampaignParticipationApi
 */

const TABLE_NAME = 'lti_campaign_participations';

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

  /**
   * Idempotent: does nothing when a row already exists for the same clientId, platformUserSub, lineItemContainerUrl and campaignId.
   *
   * @param {object} args
   * @param {string} args.clientId
   * @param {string} args.platformUserSub
   * @param {string} args.lineItemContainerUrl
   * @param {number} args.campaignId
   * @returns {Promise<void>}
   */
  async save({ clientId, platformUserSub, lineItemContainerUrl, campaignId }) {
    const knexConn = DomainTransaction.getConnection();
    await knexConn(TABLE_NAME)
      .insert({ clientId, platformUserSub, lineItemContainerUrl, campaignId })
      .onConflict(['clientId', 'platformUserSub', 'lineItemContainerUrl', 'campaignId'])
      .ignore();
  },
};
