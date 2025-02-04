import _ from 'lodash';

import { knex } from '../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { KnowledgeElement } from '../../domain/models/KnowledgeElement.js';

const tableName = 'knowledge-elements';

function _getUniqMostRecents(knowledgeElements) {
  return _(knowledgeElements).orderBy('createdAt', 'desc').uniqBy('skillId').value();
}

function _dropResetKnowledgeElements(knowledgeElements) {
  return _.reject(knowledgeElements, { status: KnowledgeElement.StatusType.RESET });
}

function _applyFilters(knowledgeElements) {
  const uniqsMostRecentPerSkill = _getUniqMostRecents(knowledgeElements);
  return _dropResetKnowledgeElements(uniqsMostRecentPerSkill);
}

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

  const knowledgeElements = _.map(
    knowledgeElementRows,
    (knowledgeElementRow) => new KnowledgeElement(knowledgeElementRow),
  );
  return _applyFilters(knowledgeElements);
}

const findUniqByUserIds = function (userIds) {
  return Promise.all(
    userIds.map(async (userId) => {
      const knowledgeElements = await findAssessedByUserIdAndLimitDateQuery({
        userId,
      });

      return { userId, knowledgeElements };
    }),
  );
};

const batchSave = async function ({ knowledgeElements }) {
  const knexConn = DomainTransaction.getConnection();
  const knowledgeElementsToSave = knowledgeElements.map((ke) => _.omit(ke, ['id', 'createdAt']));
  const savedKnowledgeElements = await knexConn.batchInsert(tableName, knowledgeElementsToSave).returning('*');
  return savedKnowledgeElements.map((ke) => new KnowledgeElement(ke));
};

const findUniqByUserId = function ({ userId, limitDate, skillIds }) {
  return findAssessedByUserIdAndLimitDateQuery({ userId, limitDate, skillIds });
};

const findUniqByUserIdAndAssessmentId = async function ({ userId, assessmentId }) {
  const query = _findByUserIdAndLimitDateQuery({ userId });
  const knowledgeElementRows = await query.where({ assessmentId });

  const knowledgeElements = _.map(
    knowledgeElementRows,
    (knowledgeElementRow) => new KnowledgeElement(knowledgeElementRow),
  );
  return _applyFilters(knowledgeElements);
};

const findUniqByUserIdAndCompetenceId = async function ({ userId, competenceId }) {
  const knowledgeElements = await findAssessedByUserIdAndLimitDateQuery({ userId });
  return knowledgeElements.filter((knowledgeElement) => knowledgeElement.competenceId === competenceId);
};

const findUniqByUserIdGroupedByCompetenceId = async function ({ userId, limitDate }) {
  const knowledgeElements = await this.findUniqByUserId({ userId, limitDate });
  return _.groupBy(knowledgeElements, 'competenceId');
};

const findInvalidatedAndDirectByUserId = async function (userId) {
  const invalidatedKnowledgeElements = await knex(tableName)
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
};
