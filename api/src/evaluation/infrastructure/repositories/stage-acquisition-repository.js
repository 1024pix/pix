import {
  CAMPAIGN_PARTICIPATION_ID_COLUMN,
  STAGE_ACQUISITIONS_TABLE_NAME,
  STAGE_ID_COLUMN,
} from '../../../../db/migrations/20230721114848_create-stage_acquisitions-table.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
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
  return knexConnection(STAGE_ACQUISITIONS_TABLE_NAME)
    .select(`${STAGE_ACQUISITIONS_TABLE_NAME}.*`)
    .from(STAGE_ACQUISITIONS_TABLE_NAME);
};

/**
 * @param {number[]} campaignParticipationsIds
 *
 * @returns Promise<StageAcquisition[]>
 */
const getByCampaignParticipations = async (campaignParticipationsIds) =>
  toDomain(await buildSelectAllQuery().whereIn(CAMPAIGN_PARTICIPATION_ID_COLUMN, campaignParticipationsIds));

/**
 * @param {number} campaignParticipationsId
 *
 * @returns {Promise<StageAcquisition[]>}
 */
const getByCampaignParticipation = async (campaignParticipationsId) =>
  toDomain(await buildSelectAllQuery().where(CAMPAIGN_PARTICIPATION_ID_COLUMN, campaignParticipationsId));

/**
 * @param {number} campaignParticipationsId
 *
 * @returns {Promise<number[]>}
 */
const getStageIdsByCampaignParticipation = async (campaignParticipationsId) => {
  const knexConnection = DomainTransaction.getConnection();
  return knexConnection(STAGE_ACQUISITIONS_TABLE_NAME)
    .where(CAMPAIGN_PARTICIPATION_ID_COLUMN, campaignParticipationsId)
    .pluck(STAGE_ID_COLUMN);
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
  return knexConnection(STAGE_ACQUISITIONS_TABLE_NAME).insert(acquiredStages);
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
