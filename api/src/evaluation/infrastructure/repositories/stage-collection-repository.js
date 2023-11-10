import { knex } from '../../../../db/knex-database-connection.js';
import { StageCollection } from '../../../shared/domain/models/target-profile-management/StageCollection.js';

const getByTargetProfileId = async function (targetProfileId) {
  const stages = await knex('stages').where({ targetProfileId }).orderBy('id', 'asc');
  const { max: maxLevel } = await knex('target-profile_tubes')
    .max('level')
    .where('targetProfileId', targetProfileId)
    .first();

  return new StageCollection({ id: targetProfileId, stages, maxLevel });
};

const update = async function (stageCollectionUpdate) {
  const stageIdsToDelete = stageCollectionUpdate.stageIdsToDelete;
  const stagesToUpdate = stageCollectionUpdate.stagesToUpdate.map((stage) => ({
    id: stage.id,
    level: stage.level,
    threshold: stage.threshold,
    isFirstSkill: stage.isFirstSkill,
    title: stage.title,
    message: stage.message,
    prescriberTitle: stage.prescriberTitle,
    prescriberDescription: stage.prescriberDescription,
    targetProfileId: stage.targetProfileId,
  }));
  const stagesToCreate = stageCollectionUpdate.stagesToCreate.map((stage) => ({
    level: stage.level,
    threshold: stage.threshold,
    isFirstSkill: stage.isFirstSkill,
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
};

export { getByTargetProfileId, update };
