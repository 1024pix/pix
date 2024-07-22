import { DomainTransaction } from '../DomainTransaction.js';
const TABLE_NAME = 'target-profile-trainings';

const create = async function ({ trainingId, targetProfileIds }) {
  const knexConn = DomainTransaction.getConnection();
  const targetProfileTrainingsToInsert = targetProfileIds.map((targetProfileId) => {
    return { trainingId, targetProfileId };
  });
  const attachedTargetProfileIds = await knexConn(TABLE_NAME)
    .insert(targetProfileTrainingsToInsert)
    .onConflict(['targetProfileId', 'trainingId'])
    .merge({ updatedAt: new Date() })
    .returning('targetProfileId')
    .orderBy('targetProfileId', 'asc');
  return attachedTargetProfileIds.map(({ targetProfileId }) => targetProfileId);
};

export { create };
