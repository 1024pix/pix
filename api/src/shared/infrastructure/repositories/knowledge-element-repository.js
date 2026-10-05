import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { KnowledgeElement } from '../../domain/models/KnowledgeElement.js';
import * as knowledgeElementFromKnowledgeStatesRepository from './knowledge-element-from-knowledge-states-repository.ts';
import * as knowledgeStateMigrationRepository from './knowledge-state-migration-repository.ts';

const tableName = 'knowledge-elements';

function _findByUserIdAndLimitDateQuery({ userId, limitDate, skillIds = [] }) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn(tableName).where((qb) => {
    qb.where({ userId });
    if (limitDate) {
      qb.where('createdAt', '<', limitDate);
    }
    if (skillIds.length) {
      qb.whereIn('skillId', skillIds);
    }
  });
}

// The users found in the migration table have their knowledge stored as
// knowledge states: their knowledge elements are read from and saved into
// them, not in the knowledge elements table.
async function _isMigrated(userId) {
  const migratedUserIds = await knowledgeStateMigrationRepository.findMigratedUserIds({ userIds: [userId] });
  return migratedUserIds.has(userId);
}

async function _findUniqOfMigratedUser({ userId, limitDate, skillIds }) {
  const knowledgeElementsByUserId = await knowledgeElementFromKnowledgeStatesRepository.findUniqByUserIds({
    userIds: [userId],
    limitDate,
    skillIds,
  });
  return knowledgeElementsByUserId.get(userId);
}

async function _findUniqByUserIds({ userIds, findRows, skillIds }) {
  const migratedUserIds = await knowledgeStateMigrationRepository.findMigratedUserIds({ userIds });
  const otherUserIds = userIds.filter((userId) => !migratedUserIds.has(userId));

  const knowledgeElementRows = otherUserIds.length > 0 ? await findRows(otherUserIds) : [];
  const knowledgeElementsOfMigratedUsers =
    skillIds?.length === 0
      ? new Map()
      : await knowledgeElementFromKnowledgeStatesRepository.findUniqByUserIds({
          userIds: [...migratedUserIds],
          skillIds,
        });

  return groupUniqKnowledgeElementsByUserId({ userIds, knowledgeElementRows }).map(({ userId, knowledgeElements }) => ({
    userId,
    knowledgeElements: migratedUserIds.has(userId)
      ? (knowledgeElementsOfMigratedUsers.get(userId) ?? [])
      : knowledgeElements,
  }));
}

async function findAssessedByUserIdAndLimitDateQuery({ userId, limitDate, skillIds }) {
  if (await _isMigrated(userId)) {
    return _findUniqOfMigratedUser({ userId, limitDate, skillIds });
  }
  const knowledgeElementRows = await _findByUserIdAndLimitDateQuery({ userId, limitDate, skillIds });
  return KnowledgeElement.toLatestUniqNonResetCollection(knowledgeElementRows);
}

const groupUniqKnowledgeElementsByUserId = ({ userIds, knowledgeElementRows }) => {
  const knowledgeElementsByUserId = new Map(userIds.map((userId) => [userId, []]));
  for (const row of knowledgeElementRows) {
    knowledgeElementsByUserId.get(row.userId)?.push(new KnowledgeElement(row));
  }
  return userIds.map((userId) => {
    return {
      userId,
      knowledgeElements: KnowledgeElement.toLatestUniqNonResetCollection(knowledgeElementsByUserId.get(userId)),
    };
  });
};

const findUniqByUserIds = async function ({ userIds }) {
  if (userIds.length === 0) return [];

  const knexConn = DomainTransaction.getConnection();
  const findRows = (otherUserIds) => knexConn(tableName).whereIn('userId', otherUserIds);

  return _findUniqByUserIds({ userIds, findRows });
};

const findUniqByUserIdsAndSkillIds = async function ({ userIds, skillIds }) {
  if (userIds.length === 0) return [];

  const knexConn = DomainTransaction.getConnection();
  const findRows = (otherUserIds) => knexConn(tableName).whereIn('userId', otherUserIds).whereIn('skillId', skillIds);

  return _findUniqByUserIds({ userIds, findRows, skillIds });
};

const batchSave = async function ({ knowledgeElements }) {
  const userIds = [...new Set(knowledgeElements.map(({ userId }) => userId))];
  const migratedUserIds = await knowledgeStateMigrationRepository.findMigratedUserIds({ userIds });
  if (migratedUserIds.size === 0) {
    return _batchInsert({ knowledgeElements });
  }

  const savedKnowledgeElements = await _batchInsert({
    knowledgeElements: knowledgeElements.filter(({ userId }) => !migratedUserIds.has(userId)),
  });
  const knowledgeElementsOfMigratedUsers = await knowledgeElementFromKnowledgeStatesRepository.batchSave({
    knowledgeElements: knowledgeElements.filter(({ userId }) => migratedUserIds.has(userId)),
  });

  return [...savedKnowledgeElements, ...knowledgeElementsOfMigratedUsers];
};

const _batchInsert = async function ({ knowledgeElements }) {
  const knexConn = DomainTransaction.getConnection();
  // eslint-disable-next-line no-unused-vars
  const knowledgeElementsToSave = knowledgeElements.map(({ id, createdAt, ...ke }) => ke);
  const savedKnowledgeElements = await knexConn
    .batchInsert(tableName, knowledgeElementsToSave)
    .transacting(knexConn.isTransaction ? knexConn : null)
    .returning('*');
  return savedKnowledgeElements.map((ke) => new KnowledgeElement(ke));
};

const findUniqByUserId = function ({ userId, limitDate, skillIds }) {
  return findAssessedByUserIdAndLimitDateQuery({ userId, limitDate, skillIds });
};

const findUniqByUserIdAndCompetenceId = async function ({ userId, competenceId }) {
  const knowledgeElements = await findAssessedByUserIdAndLimitDateQuery({ userId });
  return knowledgeElements.filter((knowledgeElement) => knowledgeElement.competenceId === competenceId);
};

const findUniqByUserIdGroupedByCompetenceId = async function ({ userId, limitDate }) {
  const knowledgeElements = await findUniqByUserId({ userId, limitDate });
  return Object.groupBy(knowledgeElements, (knowledgeElement) => knowledgeElement.competenceId);
};

const findInvalidatedAndDirectByUserId = async function ({ userId }) {
  if (await _isMigrated(userId)) {
    const knowledgeElements = await _findUniqOfMigratedUser({ userId });
    return knowledgeElements.filter(
      ({ status, source }) =>
        status === KnowledgeElement.StatusType.INVALIDATED && source === KnowledgeElement.SourceType.DIRECT,
    );
  }

  const knexConn = DomainTransaction.getConnection();
  const invalidatedKnowledgeElements = await knexConn(tableName)
    .where({
      userId,
      status: KnowledgeElement.StatusType.INVALIDATED,
      source: KnowledgeElement.SourceType.DIRECT,
    })
    .orderBy('createdAt', 'desc');

  if (!invalidatedKnowledgeElements.length) {
    return [];
  }

  return invalidatedKnowledgeElements.map(
    (invalidatedKnowledgeElement) => new KnowledgeElement(invalidatedKnowledgeElement),
  );
};

export {
  batchSave,
  findInvalidatedAndDirectByUserId,
  findUniqByUserId,
  findUniqByUserIdAndCompetenceId,
  findUniqByUserIdGroupedByCompetenceId,
  findUniqByUserIds,
  findUniqByUserIdsAndSkillIds,
};
