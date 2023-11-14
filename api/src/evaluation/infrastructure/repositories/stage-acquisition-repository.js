import { knex } from '../../../../db/knex-database-connection.js';

import {
  CAMPAIGN_PARTICIPATION_ID_COLUMN,
  STAGE_ACQUISITIONS_TABLE_NAME,
  STAGE_ID_COLUMN,
  USER_ID_COLUMN,
} from '../../../../db/migrations/20230721114848_create-stage_acquisitions-table.js';
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
 * @param {Knex} knexConnection
 * @param {string[]} selectedFields
 *
 * @returns {*}
 */
const buildSelectAllQuery = (knexConnection) =>
  knexConnection(STAGE_ACQUISITIONS_TABLE_NAME)
    .select(`${STAGE_ACQUISITIONS_TABLE_NAME}.*`)
    .from(STAGE_ACQUISITIONS_TABLE_NAME);

/**
 * @param {number[]} campaignParticipationsIds
 * @param {Knex} knexConnection
 *
 * @returns Promise<StageAcquisition[]>
 */
const getByCampaignParticipations = async (campaignParticipationsIds, knexConnection = knex) =>
  toDomain(
    await buildSelectAllQuery(knexConnection).whereIn(CAMPAIGN_PARTICIPATION_ID_COLUMN, campaignParticipationsIds),
  );

/**
 * @param {number} campaignParticipationsId
 * @param {Knex} knexConnection
 *
 * @returns {Promise<StageAcquisition[]>}
 */
const getByCampaignParticipation = async (campaignParticipationsId, knexConnection = knex) =>
  toDomain(await buildSelectAllQuery(knexConnection).where(CAMPAIGN_PARTICIPATION_ID_COLUMN, campaignParticipationsId));

/**
 * @param {number} campaignParticipationsId
 * @param {Knex} knexConnection
 *
 * @returns {Promise<number[]>}
 */
const getStageIdsByCampaignParticipation = async (campaignParticipationsId, knexConnection = knex) =>
  await knexConnection(STAGE_ACQUISITIONS_TABLE_NAME)
    .where(CAMPAIGN_PARTICIPATION_ID_COLUMN, campaignParticipationsId)
    .pluck(STAGE_ID_COLUMN);

/**
 * @param {number} campaignId
 * @param {number} userId
 * @param {Knex} knexConnection
 *
 * @returns {Promise<StageAcquisition[]>}
 */
const getByCampaignIdAndUserId = async (campaignId, userId, knexConnection = knex) =>
  toDomain(
    await buildSelectAllQuery(knexConnection)
      .join(
        'campaign-participations',
        'campaign-participations.id',
        `${STAGE_ACQUISITIONS_TABLE_NAME}.${CAMPAIGN_PARTICIPATION_ID_COLUMN}`,
      )
      .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
      .where('campaigns.id', campaignId)
      .where(`${STAGE_ACQUISITIONS_TABLE_NAME}.${USER_ID_COLUMN}`, userId)
      .orderBy(`${STAGE_ACQUISITIONS_TABLE_NAME}.id`),
  );

/**
 * @param {Stage[]} stages
 * @param {number} userId
 * @param {number} campaignParticipationId
 * @param {Knex} knexConnection
 *
 * @returns {Promise<[]>}
 */
const saveStages = async (stages, userId, campaignParticipationId, knexConnection = knex) => {
  const acquiredStages = stages.map((stage) => ({
    stageId: stage.id,
    userId,
    campaignParticipationId,
  }));
  return knexConnection(STAGE_ACQUISITIONS_TABLE_NAME).insert(acquiredStages);
};

export {
  getByCampaignParticipations,
  getByCampaignIdAndUserId,
  saveStages,
  getByCampaignParticipation,
  getStageIdsByCampaignParticipation,
};
