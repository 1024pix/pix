import { KnowledgeElementCollection } from '../../../prescription/shared/domain/models/KnowledgeElementCollection.js';
import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { KnowledgeElement } from '../../domain/models/KnowledgeElement.js';

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

async function findAssessedByUserIdAndLimitDateQuery({ userId, limitDate, skillIds }) {
  const knowledgeElementRows = await _findByUserIdAndLimitDateQuery({ userId, limitDate, skillIds });

  const keCollection = new KnowledgeElementCollection(
    knowledgeElementRows.map((knowledgeElementRow) => new KnowledgeElement(knowledgeElementRow)),
  );
  return keCollection.latestUniqNonResetKnowledgeElements;
}

const groupUniqKnowledgeElementsByUserId = ({ userIds, knowledgeElementRows }) => {
  const knowledgeElementsByUserId = new Map(userIds.map((userId) => [userId, []]));
  for (const row of knowledgeElementRows) {
    knowledgeElementsByUserId.get(row.userId)?.push(new KnowledgeElement(row));
  }

  return userIds.map((userId) => {
    const keCollection = new KnowledgeElementCollection(knowledgeElementsByUserId.get(userId));
    return {
      userId,
      knowledgeElements: keCollection.latestUniqNonResetKnowledgeElements,
    };
  });
};

const findUniqByUserIds = async function ({ userIds }) {
  if (userIds.length === 0) return [];

  const knexConn = DomainTransaction.getConnection();
  const knowledgeElementRows = await knexConn(tableName).whereIn('userId', userIds);

  return groupUniqKnowledgeElementsByUserId({ userIds, knowledgeElementRows });
};

const findUniqByUserIdsAndSkillIds = async function ({ userIds, skillIds }) {
  if (userIds.length === 0) return [];

  const knexConn = DomainTransaction.getConnection();
  const knowledgeElementRows = await knexConn(tableName).whereIn('userId', userIds).whereIn('skillId', skillIds);

  return groupUniqKnowledgeElementsByUserId({ userIds, knowledgeElementRows });
};

const batchSave = async function ({ knowledgeElements }) {
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

const findUniqByUserIdAndAssessmentId = async function ({ userId, assessmentId }) {
  const query = _findByUserIdAndLimitDateQuery({ userId });
  const knowledgeElementRows = await query.where({ assessmentId });

  const keCollection = new KnowledgeElementCollection(
    knowledgeElementRows.map((knowledgeElementRow) => new KnowledgeElement(knowledgeElementRow)),
  );
  return keCollection.latestUniqNonResetKnowledgeElements;
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
  findAssessedByUserIdAndLimitDateQuery,
  findInvalidatedAndDirectByUserId,
  findUniqByUserId,
  findUniqByUserIdAndAssessmentId,
  findUniqByUserIdAndCompetenceId,
  findUniqByUserIdGroupedByCompetenceId,
  findUniqByUserIds,
  findUniqByUserIdsAndSkillIds,
};
