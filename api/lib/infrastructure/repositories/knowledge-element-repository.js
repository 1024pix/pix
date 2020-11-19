const _ = require('lodash');
const bluebird = require('bluebird');
const constants = require('../constants');
const { knex } = require('../bookshelf');
const KnowledgeElement = require('../../domain/models/KnowledgeElement');
const BookshelfKnowledgeElement = require('../data/knowledge-element');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const knowledgeElementSnapshotRepository = require('./knowledge-element-snapshot-repository');
const DomainTransaction = require('../../infrastructure/DomainTransaction');

function _getUniqMostRecents(knowledgeElements) {
  return _(knowledgeElements)
    .orderBy('createdAt', 'desc')
    .uniqBy('skillId')
    .value();
}

function _dropResetKnowledgeElements(knowledgeElements) {
  return _.reject(knowledgeElements, { status: KnowledgeElement.StatusType.RESET });
}

function _applyFilters(knowledgeElements) {
  const uniqsMostRecentPerSkill = _getUniqMostRecents(knowledgeElements);
  return _dropResetKnowledgeElements(uniqsMostRecentPerSkill);
}

function _findByUserIdAndLimitDateQuery({ userId, limitDate }) {
  return knex('knowledge-elements')
    .where((qb) => {
      qb.where({ userId });
      if (limitDate) {
        qb.where('createdAt', '<', limitDate);
      }
    });
}

async function _findAssessedByUserIdAndLimitDateQuery({ userId, limitDate }) {
  const knowledgeElementRows = await _findByUserIdAndLimitDateQuery({ userId, limitDate });

  const knowledgeElements = _.map(knowledgeElementRows, (knowledgeElementRow) => new KnowledgeElement(knowledgeElementRow));
  return _applyFilters(knowledgeElements);
}

async function _filterValidatedKnowledgeElementsByCampaignId(knowledgeElements, campaignId) {
  const targetProfileSkillsFromDB = await knex('target-profiles_skills')
    .select('target-profiles_skills.skillId')
    .join('target-profiles', 'target-profiles.id', 'target-profiles_skills.targetProfileId')
    .join('campaigns', 'campaigns.targetProfileId', 'target-profiles.id')
    .where('campaigns.id', '=', campaignId);

  const targetProfileSkillIds = _.map(targetProfileSkillsFromDB, 'skillId');

  return _.filter(knowledgeElements, (knowledgeElement) => {
    if (knowledgeElement.isInvalidated) {
      return false;
    }
    return _.includes(targetProfileSkillIds, knowledgeElement.skillId);
  });
}

async function _findByUserIdAndLimitDateThenSaveSnapshot({ userId, limitDate }) {
  const knowledgeElements = await _findAssessedByUserIdAndLimitDateQuery({ userId, limitDate });
  if (limitDate) {
    await knowledgeElementSnapshotRepository.save({ userId, snappedAt: limitDate, knowledgeElements });
  }
  return knowledgeElements;
}

async function _findSnapshotsForUsers(userIdsAndDates) {
  const knowledgeElementsGroupedByUser = await knowledgeElementSnapshotRepository.findByUserIdsAndSnappedAtDates(userIdsAndDates);

  for (const [userIdStr, knowledgeElementsFromSnapshot] of Object.entries(knowledgeElementsGroupedByUser)) {
    const userId = parseInt(userIdStr);
    let knowledgeElements = knowledgeElementsFromSnapshot;
    if (!knowledgeElements) {
      knowledgeElements = await _findByUserIdAndLimitDateThenSaveSnapshot({
        userId,
        limitDate: userIdsAndDates[userId],
      });
    }
    knowledgeElementsGroupedByUser[userId] = knowledgeElements;
  }
  return knowledgeElementsGroupedByUser;
}

async function _countValidatedTargetedByCompetencesForUsers(userIdsAndDates, targetProfileWithLearningContent) {
  const knowledgeElementsGroupedByUser = await _findSnapshotsForUsers(userIdsAndDates);
  return targetProfileWithLearningContent.countValidatedTargetedKnowledgeElementsByCompetence(_.flatMap(knowledgeElementsGroupedByUser));
}

module.exports = {

  async save(knowledgeElement) {
    const knowledgeElementToSave = _.omit(knowledgeElement, ['id', 'createdAt']);
    const savedKnowledgeElement = await new BookshelfKnowledgeElement(knowledgeElementToSave).save();

    return bookshelfToDomainConverter.buildDomainObject(BookshelfKnowledgeElement, savedKnowledgeElement);
  },

  async findUniqByUserId({ userId, limitDate }) {
    return _findAssessedByUserIdAndLimitDateQuery({ userId, limitDate });
  },

  async findUniqByUserIdAndAssessmentId({ userId, assessmentId }) {
    const query = _findByUserIdAndLimitDateQuery({ userId });
    const knowledgeElementRows = await query.where({ assessmentId });

    const knowledgeElements = _.map(knowledgeElementRows, (knowledgeElementRow) => new KnowledgeElement(knowledgeElementRow));
    return _applyFilters(knowledgeElements);
  },

  async findUniqByUserIdAndCompetenceId({ userId, competenceId, domainTransaction = DomainTransaction.emptyTransaction() }) {
    const query = _findByUserIdAndLimitDateQuery({ userId });
    const knowledgeElementRows = await query.where({ competenceId }, { transacting: domainTransaction });

    const knowledgeElements = _.map(knowledgeElementRows, (knowledgeElementRow) => new KnowledgeElement(knowledgeElementRow));
    return _applyFilters(knowledgeElements);
  },

  async findUniqByUserIdGroupedByCompetenceId({ userId, limitDate }) {
    const knowledgeElements = await this.findUniqByUserId({ userId, limitDate });
    return _.groupBy(knowledgeElements, 'competenceId');
  },

  async findByCampaignIdAndUserIdForSharedCampaignParticipation({ campaignId, userId }) {
    const [sharedCampaignParticipation] = await knex('campaign-participations')
      .select('sharedAt')
      .where({ campaignId, isShared: 'true', userId })
      .limit(1);

    if (!sharedCampaignParticipation) {
      return [];
    }

    const { sharedAt } = sharedCampaignParticipation;
    const knowledgeElements = await _findAssessedByUserIdAndLimitDateQuery({ userId, limitDate: sharedAt });

    return _filterValidatedKnowledgeElementsByCampaignId(knowledgeElements, campaignId);
  },

  async findByCampaignIdForSharedCampaignParticipation(campaignId) {
    const sharedCampaignParticipations = await knex('campaign-participations')
      .select('userId', 'sharedAt')
      .where({ campaignId, isShared: 'true' });

    const knowledgeElements = _.flatMap(await bluebird.map(sharedCampaignParticipations,
      async ({ userId, sharedAt }) => {
        return _findAssessedByUserIdAndLimitDateQuery({ userId, limitDate: sharedAt });
      },
      { concurrency: constants.CONCURRENCY_HEAVY_OPERATIONS },
    ));

    return _filterValidatedKnowledgeElementsByCampaignId(knowledgeElements, campaignId);
  },

  async findSnapshotGroupedByCompetencesForUsers(userIdsAndDates) {
    const knowledgeElementsGroupedByUser = await _findSnapshotsForUsers(userIdsAndDates);

    for (const [userId, knowledgeElements] of Object.entries(knowledgeElementsGroupedByUser)) {
      knowledgeElementsGroupedByUser[userId] = _.groupBy(knowledgeElements, 'competenceId');
    }
    return knowledgeElementsGroupedByUser;
  },

  async countValidatedTargetedByCompetencesForUsers(userIdsAndDates, targetProfileWithLearningContent) {
    return _countValidatedTargetedByCompetencesForUsers(userIdsAndDates, targetProfileWithLearningContent);
  },

  async countValidatedTargetedByCompetencesForOneUser(userId, limitDate, targetProfileWithLearningContent) {
    return _countValidatedTargetedByCompetencesForUsers({ [userId]: limitDate }, targetProfileWithLearningContent);
  },

  async findTargetedGroupedByCompetencesForUsers(userIdsAndDates, targetProfileWithLearningContent) {
    const knowledgeElementsGroupedByUser = await _findSnapshotsForUsers(userIdsAndDates);
    const knowledgeElementsGroupedByUserAndCompetence = {};

    for (const [userId, knowledgeElements] of Object.entries(knowledgeElementsGroupedByUser)) {
      knowledgeElementsGroupedByUserAndCompetence[userId] = targetProfileWithLearningContent.getKnowledgeElementsGroupedByCompetence(knowledgeElements);
    }

    return knowledgeElementsGroupedByUserAndCompetence;
  },

  async findValidatedTargetedGroupedByTubes(userIdsAndDates, targetProfileWithLearningContent) {
    const knowledgeElementsGroupedByUser = await _findSnapshotsForUsers(userIdsAndDates);

    return targetProfileWithLearningContent.getValidatedKnowledgeElementsGroupedByTube(_.flatMap(knowledgeElementsGroupedByUser));
  },

  async findSnapshotForUsers(userIdsAndDates) {
    return _findSnapshotsForUsers(userIdsAndDates);
  },

};

