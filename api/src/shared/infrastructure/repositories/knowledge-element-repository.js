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
const findUniqByUserIdsFromElementsOrKnowledgeStates = async (userIds, findRows, skillIds) => {
  const migratedUserIds = new Set(await knowledgeStateMigrationRepository.findMigratedUserIds(userIds));
  const otherUserIds = userIds.filter((userId) => !migratedUserIds.has(userId));

  const [knowledgeElementRows, knowledgeElementsOfMigratedUsers] = await Promise.all([
    otherUserIds.length > 0 ? findRows(otherUserIds) : [],
    skillIds?.length === 0
      ? new Map()
      : knowledgeElementFromKnowledgeStatesRepository.findUniqByUserIds([...migratedUserIds], skillIds),
  ]);

  return groupUniqKnowledgeElementsByUserId({ userIds, knowledgeElementRows }).map(({ userId, knowledgeElements }) => ({
    userId,
    knowledgeElements: migratedUserIds.has(userId)
      ? (knowledgeElementsOfMigratedUsers.get(userId) ?? [])
      : knowledgeElements,
  }));
};

async function findAssessedByUserIdAndLimitDateQuery({ userId, limitDate, skillIds }) {
  if (await knowledgeStateMigrationRepository.isMigrated(userId)) {
    return knowledgeElementFromKnowledgeStatesRepository.findUniqByUserId(userId, skillIds, limitDate);
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

  return findUniqByUserIdsFromElementsOrKnowledgeStates(userIds, findRows);
};

const findUniqByUserIdsAndSkillIds = async function ({ userIds, skillIds }) {
  if (userIds.length === 0) return [];

  const knexConn = DomainTransaction.getConnection();
  const findRows = (otherUserIds) => knexConn(tableName).whereIn('userId', otherUserIds).whereIn('skillId', skillIds);

  return findUniqByUserIdsFromElementsOrKnowledgeStates(userIds, findRows, skillIds);
};

// A save holds the knowledge elements of one user: those of an answer, or
// those of a reset. The routing relies on it.
const userIdOf = (knowledgeElements) => {
  const userIds = new Set(knowledgeElements.map(({ userId }) => userId));
  if (userIds.size !== 1) {
    throw new Error(`A save holds the knowledge elements of one user, not ${userIds.size}`);
  }
  return knowledgeElements[0].userId;
};

const batchSave = async function ({ knowledgeElements }) {
  if (knowledgeElements.length === 0) return [];

  if (await knowledgeStateMigrationRepository.isMigrated(userIdOf(knowledgeElements))) {
    return knowledgeElementFromKnowledgeStatesRepository.batchSave(knowledgeElements);
  }
  return batchInsert(knowledgeElements);
};

const batchInsert = async (knowledgeElements) => {
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
  if (await knowledgeStateMigrationRepository.isMigrated(userId)) {
    const knowledgeElements = await knowledgeElementFromKnowledgeStatesRepository.findUniqByUserId(userId);
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
