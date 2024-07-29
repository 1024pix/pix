import {
  CAMPAIGN_PARTICIPATION_ID_COLUMN,
  STAGE_ACQUISITIONS_TABLE_NAME,
  STAGE_ID_COLUMN,
  USER_ID_COLUMN,
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
 * @param {number} campaignId
 * @param {number} userId
 *
 * @returns {Promise<StageAcquisition[]>}
 */
const getByCampaignIdAndUserId = async (campaignId, userId) =>
  toDomain(
    await buildSelectAllQuery()
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
 *
 * @returns {Promise<[]>}
 */
const saveStages = async (stages, userId, campaignParticipationId) => {
  const knexConnection = DomainTransaction.getConnection();
  const acquiredStages = stages.map((stage) => ({
    stageId: stage.id,
    userId,
    campaignParticipationId,
  }));
  return knexConnection(STAGE_ACQUISITIONS_TABLE_NAME).insert(acquiredStages);
};

export {
  getByCampaignIdAndUserId,
  getByCampaignParticipation,
  getByCampaignParticipations,
  getStageIdsByCampaignParticipation,
  saveStages,
};
