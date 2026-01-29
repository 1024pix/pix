import { StageCollection } from '../../../prescription/target-profile/domain/models/StageCollection.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';

const getByTargetProfileId = async function (targetProfileId) {
  const knexConn = DomainTransaction.getConnection();
  const stages = await knexConn('stages').where({ targetProfileId }).orderBy('id', 'asc');
  const { max: maxLevel } = await knexConn('target-profile_tubes')
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
  await DomainTransaction.execute(async () => {
    const knexConn = DomainTransaction.getConnection();
    await knexConn('stages').whereIn('id', stageIdsToDelete).del();
    await knexConn('stages')
      .insert([...stagesToCreate, ...stagesToUpdate])
      .onConflict('id')
      .merge();
  });
};

export { getByTargetProfileId, update };
