import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { StageAcquisition } from '../../domain/models/StageAcquisition.js';

/**
 * @typedef stageData
 * @type {object}
 * @property {number} id
 * @property {number} userId
 * @property {number} stageId
 * @property {number} campaignParticipationId
 */

/**
 * @param {stageData[]} stageAcquisitionData
 * @returns {StageAcquisition[]}
 */
const toDomain = (stageAcquisitionData) =>
  stageAcquisitionData.map((data) => {
    return new StageAcquisition(data);
  });

/**
 * @param {string[]} selectedFields
 *
 * @returns {*}
 */
const buildSelectAllQuery = () => {
  const knexConnection = DomainTransaction.getConnection();
  return knexConnection('stage-acquisitions').select('stage-acquisitions.*').from('stage-acquisitions');
};

/**
 * @param {number[]} campaignParticipationsIds
 *
 * @returns Promise<StageAcquisition[]>
 */
const getByCampaignParticipations = async (campaignParticipationsIds) =>
  toDomain(await buildSelectAllQuery().whereIn('campaignParticipationId', campaignParticipationsIds));

/**
 * @param {number} campaignParticipationsId
 *
 * @returns {Promise<StageAcquisition[]>}
 */
const getByCampaignParticipation = async (campaignParticipationsId) =>
  toDomain(await buildSelectAllQuery().where('campaignParticipationId', campaignParticipationsId));

/**
 * @param {number} campaignParticipationsId
 *
 * @returns {Promise<number[]>}
 */
const getStageIdsByCampaignParticipation = async (campaignParticipationsId) => {
  const knexConnection = DomainTransaction.getConnection();
  return knexConnection('stage-acquisitions')
    .where('campaignParticipationId', campaignParticipationsId)
    .pluck('stageId');
};

/**
 * @param {Stage[]} stages
 * @param {number} campaignParticipationId
 *
 * @returns {Promise<[]>}
 */
const saveStages = async (stages, campaignParticipationId) => {
  const knexConnection = DomainTransaction.getConnection();
  const acquiredStages = stages.map((stage) => ({
    stageId: stage.id,
    campaignParticipationId,
  }));
  return knexConnection('stage-acquisitions').insert(acquiredStages);
};

/**
 * @param {number} campaignId
 *
 * @returns {Promise<number>}
 */
export const getAverageReachedStageByCampaignId = async (campaignId) => {
  const knexConnection = DomainTransaction.getConnection();

  const result = await knexConnection.raw(
    `
    SELECT AVG("count")
    FROM (
        SELECT "campaignParticipationId", COUNT(*) AS "count"
        FROM "stage-acquisitions"
        JOIN "campaign-participations" ON "campaign-participations"."id" = "stage-acquisitions"."campaignParticipationId"
        JOIN "campaigns" ON "campaigns"."id" = "campaign-participations"."campaignId"
        WHERE "campaigns"."id" = ??
        GROUP BY "campaignParticipationId"
    ) AS "subquery";
  `,
    campaignId,
  );

  return Math.round(result.rows[0].avg);
};

export { getByCampaignParticipation, getByCampaignParticipations, getStageIdsByCampaignParticipation, saveStages };
