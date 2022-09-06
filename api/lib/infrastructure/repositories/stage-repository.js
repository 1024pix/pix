const { knex } = require('../../../db/knex-database-connection');
const Stage = require('../../domain/models/Stage');
const _ = require('lodash');
const { NotFoundError } = require('../../domain/errors');
const { PGSQL_FOREIGN_KEY_VIOLATION_ERROR } = require('../../../db/pgsql-errors');

const TABLE_NAME = 'stages';

module.exports = {
  async findByCampaignId(campaignId) {
    const results = await knex(TABLE_NAME)
      .select('stages.*')
      .join('campaigns', 'campaigns.targetProfileId', 'stages.targetProfileId')
      .where('campaigns.id', campaignId)
      .orderBy('stages.threshold', 'asc');

    return results.map(_toDomain);
  },

  async findByTargetProfileId(targetProfileId) {
    const stages = await knex(TABLE_NAME).where({ targetProfileId }).orderBy('threshold');
    return stages.map(_toDomain);
  },

  async create(stage) {
    const stageAttributes = _.pick(stage, ['title', 'message', 'threshold', 'targetProfileId']);
    const [createdStage] = await knex(TABLE_NAME).insert(stageAttributes).returning('*');
    return _toDomain(createdStage);
  },

  async create2(stageForCreation) {
    try {
      const [{ id: stageInsertedId }] = await knex(TABLE_NAME).insert(stageForCreation).returning('id');
      return stageInsertedId;
    } catch (err) {
      if (err.code === PGSQL_FOREIGN_KEY_VIOLATION_ERROR) {
        throw new NotFoundError("Le profil cible du palier n'existe pas");
      }
      throw err;
    }
  },

  async updateStage({ id, title, message, threshold, prescriberTitle, prescriberDescription }) {
    const updatedRows = await knex(TABLE_NAME)
      .where('id', id)
      .update({ title, message, threshold, prescriberTitle, prescriberDescription, updatedAt: new Date() });

    if (!updatedRows) {
      throw new NotFoundError(`Le palier avec l'id ${id} n'existe pas`);
    }
  },

  async get(id) {
    const stage = await knex(TABLE_NAME).where({ id }).first();
    if (!stage) {
      throw new NotFoundError(`Not found stage for ID ${id}`);
    }
    return _toDomain(stage);
  },
};

function _toDomain(stage) {
  return new Stage(stage);
}
