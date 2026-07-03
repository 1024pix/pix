import chunk from 'lodash/chunk.js';

import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { Quest } from '../../domain/models/quests/entities/Quest.js';

const toDomain = (quests) => quests.map((quest) => new Quest(quest));

const findAllWithReward = async ({ includeCombinedCourses }) => {
  const knexConn = DomainTransaction.getConnection();
  let query = knexConn('quests').select('quests.*').whereNotNull('rewardId');

  if (!includeCombinedCourses) {
    query = query
      .leftJoin('combined_course_blueprints', 'quests.id', 'combined_course_blueprints.questId')
      .whereNull('combined_course_blueprints.id');
  }
  const quests = await query;
  return toDomain(quests);
};

const findById = async ({ questId }) => {
  const knexConn = DomainTransaction.getConnection();

  const quest = await knexConn('quests').where('id', questId).first();

  if (!quest) return null;

  return new Quest(quest);
};

const saveInBatch = async ({ quests }) => {
  const knexConn = DomainTransaction.getConnection();

  const chunks = chunk(quests, 10);
  const questIds = [];
  for (const chunk of chunks) {
    const questsToSave = chunk.map((quest) => {
      return {
        id: quest.id,
        updatedAt: knexConn.fn.now(),
        rewardId: quest.rewardId,
        rewardType: quest.rewardType,
        eligibilityRequirements: quest.eligibilityRequirements
          ? JSON.stringify(quest.toDTO().eligibilityRequirements)
          : [],
        successRequirements: quest.successRequirements ? JSON.stringify(quest.toDTO().successRequirements) : [],
      };
    });
    const questsInserted = await knexConn('quests')
      .insert(questsToSave)
      .onConflict('id')
      .merge(['updatedAt', 'rewardId', 'rewardType', 'eligibilityRequirements', 'successRequirements'])
      .returning('id');

    questsInserted.map((quest) => questIds.push(quest.id));
  }
  return questIds;
};

const save = async ({ quest }) => {
  const knexConn = DomainTransaction.getConnection();

  const questToSave = {
    id: quest.id,
    updatedAt: knexConn.fn.now(),
    rewardId: quest.rewardId,
    rewardType: quest.rewardType,
    eligibilityRequirements: quest.eligibilityRequirements ? JSON.stringify(quest.toDTO().eligibilityRequirements) : [],
    successRequirements: quest.successRequirements ? JSON.stringify(quest.toDTO().successRequirements) : [],
  };

  const result = await knexConn('quests')
    .insert(questToSave)
    .onConflict('id')
    .merge(['updatedAt', 'rewardId', 'rewardType', 'eligibilityRequirements', 'successRequirements'])
    .returning('id');

  return result[0].id;
};

const deleteByIds = async ({ questIds }) => {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('quests').whereIn('id', questIds).delete();
};

export { deleteByIds, findAllWithReward, findById, save, saveInBatch };
