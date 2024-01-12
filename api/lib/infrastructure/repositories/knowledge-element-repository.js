import _ from 'lodash';
import { knex } from '../../../db/knex-database-connection.js';
import { KnowledgeElement } from '../../domain/models/KnowledgeElement.js';
import * as knowledgeElementSnapshotRepository from './knowledge-element-snapshot-repository.js';
import { DomainTransaction } from '../../infrastructure/DomainTransaction.js';

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

function _findByUserIdAndLimitDateQuery({
  userId,
  limitDate,
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
  const knexConn = domainTransaction.knexTransaction || knex;
  return knexConn(tableName).where((qb) => {
    qb.where({ userId });
    if (limitDate) {
      qb.where('createdAt', '<', limitDate);
    }
  });
}

async function _findAssessedByUserIdAndLimitDateQuery({ userId, limitDate, domainTransaction }) {
  const knowledgeElementRows = await _findByUserIdAndLimitDateQuery({ userId, limitDate, domainTransaction });

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

const save = async function (knowledgeElement) {
  const knowledgeElementToSave = _.omit(knowledgeElement, ['id', 'createdAt']);
  const [savedKnowledgeElement] = await knex(tableName).insert(knowledgeElementToSave).returning('*');
  return new KnowledgeElement(savedKnowledgeElement);
};

const batchSave = async function ({ knowledgeElements, domainTransaction = DomainTransaction.emptyTransaction() }) {
  const knexConn = domainTransaction.knexTransaction || knex;
  const knowledgeElementsToSave = knowledgeElements.map((ke) => _.omit(ke, ['id', 'createdAt']));
  await knexConn.batchInsert(tableName, knowledgeElementsToSave);
};

const findUniqByUserId = function ({ userId, limitDate, domainTransaction }) {
  return _findAssessedByUserIdAndLimitDateQuery({ userId, limitDate, domainTransaction });
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

const findUniqByUserIdAndCompetenceId = async function ({
  userId,
  competenceId,
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
  const knowledgeElements = await _findAssessedByUserIdAndLimitDateQuery({ userId, domainTransaction });
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
  save,
  batchSave,
  findUniqByUserId,
  findUniqByUserIdAndAssessmentId,
  findUniqByUserIdAndCompetenceId,
  findUniqByUserIdGroupedByCompetenceId,
  findSnapshotGroupedByCompetencesForUsers,
  countValidatedByCompetencesForUsersWithinCampaign,
  countValidatedByCompetencesForOneUserWithinCampaign,
  findValidatedGroupedByTubesWithinCampaign,
  findSnapshotForUsers,
  findInvalidatedAndDirectByUserId,
};
