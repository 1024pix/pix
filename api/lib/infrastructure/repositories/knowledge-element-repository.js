import _ from 'lodash';

import { knex } from '../../../db/knex-database-connection.js';
import { KnowledgeElement } from '../../../src/shared/domain/models/KnowledgeElement.js';
import { DomainTransaction } from '../../infrastructure/DomainTransaction.js';
import * as knowledgeElementSnapshotRepository from './knowledge-element-snapshot-repository.js';

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

function _findByUserIdAndLimitDateQuery({ userId, limitDate }) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn(tableName).where((qb) => {
    qb.where({ userId });
    if (limitDate) {
      qb.where('createdAt', '<', limitDate);
    }
  });
}

async function _findAssessedByUserIdAndLimitDateQuery({ userId, limitDate }) {
  const knowledgeElementRows = await _findByUserIdAndLimitDateQuery({ userId, limitDate });

  const knowledgeElements = _.map(
    knowledgeElementRows,
    (knowledgeElementRow) => new KnowledgeElement(knowledgeElementRow),
  );
  return _applyFilters(knowledgeElements);
}

async function _findSnapshotsForUsers(userIdsAndDates) {
  const knowledgeElementsGroupedByUser =
    await knowledgeElementSnapshotRepository.findByUserIdsAndSnappedAtDates(userIdsAndDates);

  for (const [userIdStr, knowledgeElementsFromSnapshot] of Object.entries(knowledgeElementsGroupedByUser)) {
    const userId = parseInt(userIdStr);
    let knowledgeElements = knowledgeElementsFromSnapshot;
    if (!knowledgeElements) {
      knowledgeElements = await _findAssessedByUserIdAndLimitDateQuery({
        userId,
        limitDate: userIdsAndDates[userId],
      });
    }
    knowledgeElementsGroupedByUser[userId] = knowledgeElements;
  }
  return knowledgeElementsGroupedByUser;
}

async function _countValidatedByCompetencesForUsersWithinCampaign(userIdsAndDates, campaignLearningContent) {
  const knowledgeElementsGroupedByUser = await _findSnapshotsForUsers(userIdsAndDates);
  return campaignLearningContent.countValidatedTargetedKnowledgeElementsByCompetence(
    _.flatMap(knowledgeElementsGroupedByUser),
  );
}

const findUniqByUserIds = function (userIds) {
  return Promise.all(
    userIds.map(async (userId) => {
      const knowledgeElements = await _findAssessedByUserIdAndLimitDateQuery({
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

const findUniqByUserId = function ({ userId, limitDate }) {
  return _findAssessedByUserIdAndLimitDateQuery({ userId, limitDate });
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
  const knowledgeElements = await _findAssessedByUserIdAndLimitDateQuery({ userId });
  return knowledgeElements.filter((knowledgeElement) => knowledgeElement.competenceId === competenceId);
};

const findUniqByUserIdGroupedByCompetenceId = async function ({ userId, limitDate }) {
  const knowledgeElements = await this.findUniqByUserId({ userId, limitDate });
  return _.groupBy(knowledgeElements, 'competenceId');
};

const findSnapshotGroupedByCompetencesForUsers = async function (userIdsAndDates) {
  const knowledgeElementsGroupedByUser = await _findSnapshotsForUsers(userIdsAndDates);

  for (const [userId, knowledgeElements] of Object.entries(knowledgeElementsGroupedByUser)) {
    knowledgeElementsGroupedByUser[userId] = _.groupBy(knowledgeElements, 'competenceId');
  }
  return knowledgeElementsGroupedByUser;
};

const countValidatedByCompetencesForUsersWithinCampaign = async function (userIdsAndDates, campaignLearningContent) {
  return _countValidatedByCompetencesForUsersWithinCampaign(userIdsAndDates, campaignLearningContent);
};

const countValidatedByCompetencesForOneUserWithinCampaign = async function (
  userId,
  limitDate,
  campaignLearningContent,
) {
  return _countValidatedByCompetencesForUsersWithinCampaign({ [userId]: limitDate }, campaignLearningContent);
};

const findValidatedGroupedByTubesWithinCampaign = async function (userIdsAndDates, campaignLearningContent) {
  const knowledgeElementsGroupedByUser = await _findSnapshotsForUsers(userIdsAndDates);

  return campaignLearningContent.getValidatedKnowledgeElementsGroupedByTube(_.flatMap(knowledgeElementsGroupedByUser));
};

const findSnapshotForUsers = async function (userIdsAndDates) {
  return _findSnapshotsForUsers(userIdsAndDates);
};

const findAllUniqValidatedByUserId = async function (userId) {
  const validatedKnowledgeElements = await knex(tableName)
    .where({
      userId,
      status: KnowledgeElement.StatusType.VALIDATED,
    })
    .orderBy('createdAt', 'desc');

  return validatedKnowledgeElements.map(
    (invalidatedKnowledgeElement) => new KnowledgeElement(invalidatedKnowledgeElement),
  );
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
  countValidatedByCompetencesForOneUserWithinCampaign,
  countValidatedByCompetencesForUsersWithinCampaign,
  findAllUniqValidatedByUserId,
  findInvalidatedAndDirectByUserId,
  findSnapshotForUsers,
  findSnapshotGroupedByCompetencesForUsers,
  findUniqByUserId,
  findUniqByUserIdAndAssessmentId,
  findUniqByUserIdAndCompetenceId,
  findUniqByUserIdGroupedByCompetenceId,
  findUniqByUserIds,
  findValidatedGroupedByTubesWithinCampaign,
};
