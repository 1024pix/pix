import { knex } from '../../../../db/knex-database-connection.js';
import { Stage } from '../../../../lib/domain/models/index.js';
import { NotFoundError } from '../../../shared/domain/errors.js';

/**
 * @typedef stageData
 * @type {object}
 * @property {number} id
 * @property {string} title
 * @property {string} message
 * @property {number|undefined} threshold
 * @property {number|undefined} level
 * @property {string} prescriberTitle
 * @property {string} prescriberDescription
 * @property {number} targetProfileId
 * @property {boolean} isFirstSkill
 */

/**
 * @param {stageData[]} stageData
 * @returns {Stage[]}
 */
const toDomain = (stageData) =>
  stageData.map((data) => {
    return new Stage(data);
  });

/**
 * @param knexConnection
 * @returns {*}
 */
const buildBaseQuery = (knexConnection) =>
  knexConnection('stages')
    .select('stages.*')
    .join('campaigns', 'campaigns.targetProfileId', 'stages.targetProfileId')
    .orderBy(['stages.threshold', 'stages.level']);

/**
 * Return a stage for a given id
 *
 * @param {number} id
 * @param knexConnection
 *
 * @returns Promise<Stage>
 */
const get = async (id, knexConnection = knex) => {
  const [stage] = await knexConnection('stages').select('stages.*').where({ id });

  if (!stage) throw new NotFoundError('Erreur, palier introuvable');

  return new Stage(stage);
};

/**
 * Return stages for multiple campaign ids
 *
 * @param {number[]} campaignIds
 * @param knexConnection
 *
 * @returns Promise<Stage[]>
 */
const getByCampaignIds = async (campaignIds, knexConnection = knex) =>
  toDomain(await buildBaseQuery(knexConnection).whereIn('campaigns.id', campaignIds));

/**
 * Return stages for one campaign id
 *
 * @param {number} campaignId
 * @param knexConnection
 *
 * @returns Promise<Stage[]>
 */
const getByCampaignId = async (campaignId, knexConnection = knex) =>
  toDomain(await buildBaseQuery(knexConnection).where('campaigns.id', campaignId));

/**
 * Return campaign stages for a campaign participation id
 *
 * @param {number} campaignParticipationId
 * @param knexConnection
 *
 * @returns Promise<Stage[]>
 */
const getByCampaignParticipationId = async (campaignParticipationId, knexConnection = knex) =>
  toDomain(
    await buildBaseQuery(knexConnection)
      .join('campaign-participations', 'campaign-participations.campaignId', 'campaigns.id')
      .where('campaign-participations.id', campaignParticipationId),
  );

/**
 * Return campaign stages for several target profile ids,
 * this is convenient for campaign overviews
 *
 * @param {[number]} targetProfileIds
 * @param knexConnection
 *
 * @returns Promise<Stage[]>
 */
const getByTargetProfileIds = async (targetProfileIds, knexConnection = knex) =>
  toDomain(await knexConnection('stages').select('stages.*').whereIn('stages.targetProfileId', targetProfileIds));

const update = async ({ id, attributesToUpdate }) => {
  const [stageToUpdate] = await knex('stages')
    .where({ id })
    .update({ ...attributesToUpdate, updatedAt: new Date() })
    .returning('*');

  return new Stage(stageToUpdate);
};

export { get, getByCampaignIds, getByCampaignId, getByCampaignParticipationId, getByTargetProfileIds, update };
