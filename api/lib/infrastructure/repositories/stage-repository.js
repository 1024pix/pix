const { knex } = require('../../../db/knex-database-connection');
const Stage = require('../../domain/models/Stage');
const _ = require('lodash');
const { NotFoundError } = require('../../domain/errors');
const TABLE_NAME = 'stages';

module.exports = {
  async create(stage) {
    const stageAttributes = _.pick(stage, ['title', 'message', 'threshold', 'targetProfileId']);
    const [createdStage] = await knex(TABLE_NAME).insert(stageAttributes).returning('*');
    return _toDomain(createdStage);
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
