import _ from 'lodash';
import bluebird from 'bluebird';
import { constants } from '../constants.js';
import { knex } from '../../../db/knex-database-connection.js';
import { KnowledgeElement } from '../../domain/models/KnowledgeElement.js';
import { CampaignParticipationStatuses } from '../../domain/models/CampaignParticipationStatuses.js';
import * as knowledgeElementSnapshotRepository from './knowledge-element-snapshot-repository.js';
import * as campaignRepository from './campaign-repository.js';
import { DomainTransaction } from '../../infrastructure/DomainTransaction.js';

const { SHARED } = CampaignParticipationStatuses;

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

async function _filterValidatedKnowledgeElementsByCampaignId(knowledgeElements, campaignId) {
  const skillIds = await campaignRepository.findSkillIds({ campaignId, filterByStatus: 'all' });

  return _.filter(knowledgeElements, (knowledgeElement) => {
    if (knowledgeElement.isInvalidated) {
      return false;
    }
    return _.includes(skillIds, knowledgeElement.skillId);
  });
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

const findByCampaignIdAndUserIdForSharedCampaignParticipation = async function ({ campaignId, userId }) {
  const [sharedCampaignParticipation] = await knex('campaign-participations')
    .select('sharedAt')
    .where({ campaignId, status: SHARED, userId })
    .limit(1);

  if (!sharedCampaignParticipation) {
    return [];
  }

  const { sharedAt } = sharedCampaignParticipation;
  const knowledgeElements = await _findAssessedByUserIdAndLimitDateQuery({ userId, limitDate: sharedAt });

  return _filterValidatedKnowledgeElementsByCampaignId(knowledgeElements, campaignId);
};

const findByCampaignIdForSharedCampaignParticipation = async function (campaignId) {
  const sharedCampaignParticipations = await knex('campaign-participations')
    .select('userId', 'sharedAt')
    .where({ campaignId, status: SHARED });

  const knowledgeElements = _.flatMap(
    await bluebird.map(
      sharedCampaignParticipations,
      async ({ userId, sharedAt }) => {
        return _findAssessedByUserIdAndLimitDateQuery({ userId, limitDate: sharedAt });
      },
      { concurrency: constants.CONCURRENCY_HEAVY_OPERATIONS },
    ),
  );

  return _filterValidatedKnowledgeElementsByCampaignId(knowledgeElements, campaignId);
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

const findGroupedByCompetencesForUsersWithinLearningContent = async function (
  userIdsAndDates,
  campaignLearningContent,
) {
  const knowledgeElementsGroupedByUser = await _findSnapshotsForUsers(userIdsAndDates);
  const knowledgeElementsGroupedByUserAndCompetence = {};

  for (const [userId, knowledgeElements] of Object.entries(knowledgeElementsGroupedByUser)) {
    knowledgeElementsGroupedByUserAndCompetence[userId] =
      campaignLearningContent.getKnowledgeElementsGroupedByCompetence(knowledgeElements);
  }

  return knowledgeElementsGroupedByUserAndCompetence;
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
  findByCampaignIdAndUserIdForSharedCampaignParticipation,
  findByCampaignIdForSharedCampaignParticipation,
  findSnapshotGroupedByCompetencesForUsers,
  countValidatedByCompetencesForUsersWithinCampaign,
  countValidatedByCompetencesForOneUserWithinCampaign,
  findGroupedByCompetencesForUsersWithinLearningContent,
  findValidatedGroupedByTubesWithinCampaign,
  findSnapshotForUsers,
  findInvalidatedAndDirectByUserId,
};
