const { knex } = require('../../../../db/knex-database-connection.js');
const StageCollection = require('../../../domain/models/target-profile-management/StageCollection.js');

module.exports = {
  async getByTargetProfileId(targetProfileId) {
    const stages = await knex('stages').where({ targetProfileId }).orderBy('id', 'asc');
    const { max: maxLevel } = await knex('target-profile_tubes')
      .max('level')
      .where('targetProfileId', targetProfileId)
      .first();

    return new StageCollection({ id: targetProfileId, stages, maxLevel });
  },

  async save(stageCollection) {
    const rawIds = await knex('stages').insert(stageCollection.stages).onConflict('id').merge().returning('id');
    return rawIds.map((rawId) => rawId.id);
  },

  delete({ id, targetProfileId }) {
    return knex('stages')
      .where({
        id,
        targetProfileId,
      })
      .delete();
  },

  async update(stageCollectionUpdate) {
    const stageIdsToDelete = stageCollectionUpdate.stageIdsToDelete;
    const stagesToUpdate = stageCollectionUpdate.stagesToUpdate.map((stage) => ({
      id: stage.id,
      level: stage.level,
      threshold: stage.threshold,
      title: stage.title,
      message: stage.message,
      prescriberTitle: stage.prescriberTitle,
      prescriberDescription: stage.prescriberDescription,
      targetProfileId: stage.targetProfileId,
    }));
    const stagesToCreate = stageCollectionUpdate.stagesToCreate.map((stage) => ({
      level: stage.level,
      threshold: stage.threshold,
      title: stage.title,
      message: stage.message,
      prescriberTitle: stage.prescriberTitle,
      prescriberDescription: stage.prescriberDescription,
      targetProfileId: stage.targetProfileId,
    }));
    await knex.transaction(async (trx) => {
      await trx('stages').whereIn('id', stageIdsToDelete).del();
      await trx('stages')
        .insert([...stagesToCreate, ...stagesToUpdate])
        .onConflict('id')
        .merge();
    });
  },
};
