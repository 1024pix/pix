import { knex } from '../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import { Stage } from '../../domain/models/Stage.js';

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

const buildBaseQuery = (knexConnection) => {
  return knexConnection('stages')
    .select('stages.*')
    .join('campaigns', 'campaigns.targetProfileId', 'stages.targetProfileId')
    .orderBy(['stages.threshold', 'stages.level']);
};

/**
 * Return a stage for a given id
 *
 * @param {number} id
 *
 * @returns Promise<Stage>
 */
const get = async (id) => {
  const knexConnection = DomainTransaction.getConnection();
  const [stage] = await knexConnection('stages').select('stages.*').where({ id });

  if (!stage) throw new NotFoundError('Erreur, palier introuvable');

  return new Stage(stage);
};

/**
 * Return stages for multiple campaign ids
 *
 * @param {number[]} campaignIds
 *
 * @returns Promise<Stage[]>
 */
const getByCampaignIds = async (campaignIds) => {
  const knexConnection = DomainTransaction.getConnection();
  return toDomain(await buildBaseQuery(knexConnection).whereIn('campaigns.id', campaignIds));
};

/**
 * Return stages for one campaign id
 *
 * @param {number} campaignId
 *
 * @returns Promise<Stage[]>
 */
const getByCampaignId = async (campaignId) => {
  const knexConnection = DomainTransaction.getConnection();
  return toDomain(await buildBaseQuery(knexConnection).where('campaigns.id', campaignId));
};

/**
 * Return campaign stages for a campaign participation id
 *
 * @param {number} campaignParticipationId
 *
 * @returns Promise<Stage[]>
 */
const getByCampaignParticipationId = async (campaignParticipationId) => {
  const knexConnection = DomainTransaction.getConnection();
  return toDomain(
    await buildBaseQuery(knexConnection)
      .join('campaign-participations', 'campaign-participations.campaignId', 'campaigns.id')
      .where('campaign-participations.id', campaignParticipationId),
  );
};

/**
 * Return campaign stages for several target profile ids,
 * this is convenient for campaign overviews
 *
 * @param {[number]} targetProfileIds
 *
 * @returns Promise<Stage[]>
 */
const getByTargetProfileIds = async (targetProfileIds) => {
  const knexConnection = DomainTransaction.getConnection();
  return toDomain(
    await knexConnection('stages').select('stages.*').whereIn('stages.targetProfileId', targetProfileIds),
  );
};

const update = async ({ id, attributesToUpdate }) => {
  const knexConnection = DomainTransaction.getConnection();
  const [stageToUpdate] = await knexConnection('stages')
    .where({ id })
    .update({ ...attributesToUpdate, updatedAt: new Date() })
    .returning('*');

  return new Stage(stageToUpdate);
};

const saveAll = async (stages) => {
  const knexConnection = DomainTransaction.getConnection();
  const createdStages = await knexConnection('stages').insert(stages).returning('*');
  return toDomain(createdStages);
};

export { get, getByCampaignId, getByCampaignIds, getByCampaignParticipationId, getByTargetProfileIds, saveAll, update };
