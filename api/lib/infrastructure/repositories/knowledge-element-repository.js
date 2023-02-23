const _ = require('lodash');
const bluebird = require('bluebird');
const constants = require('../constants.js');
const { knex } = require('../../../db/knex-database-connection.js');
const KnowledgeElement = require('../../domain/models/KnowledgeElement.js');
const CampaignParticipationStatuses = require('../../domain/models/CampaignParticipationStatuses.js');
const BookshelfKnowledgeElement = require('../orm-models/KnowledgeElement.js');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter.js');
const knowledgeElementSnapshotRepository = require('./knowledge-element-snapshot-repository.js');
const campaignRepository = require('./campaign-repository.js');
const DomainTransaction = require('../../infrastructure/DomainTransaction.js');

const { SHARED } = CampaignParticipationStatuses;

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
  return knexConn('knowledge-elements').where((qb) => {
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
    (knowledgeElementRow) => new KnowledgeElement(knowledgeElementRow)
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
  const knowledgeElementsGroupedByUser = await knowledgeElementSnapshotRepository.findByUserIdsAndSnappedAtDates(
    userIdsAndDates
  );

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
    _.flatMap(knowledgeElementsGroupedByUser)
  );
}

module.exports = {
  async save(knowledgeElement) {
    const knowledgeElementToSave = _.omit(knowledgeElement, ['id', 'createdAt']);
    const savedKnowledgeElement = await new BookshelfKnowledgeElement(knowledgeElementToSave).save();

    return bookshelfToDomainConverter.buildDomainObject(BookshelfKnowledgeElement, savedKnowledgeElement);
  },

  findUniqByUserId({ userId, limitDate, domainTransaction }) {
    return _findAssessedByUserIdAndLimitDateQuery({ userId, limitDate, domainTransaction });
  },

  async findUniqByUserIdAndAssessmentId({ userId, assessmentId }) {
    const query = _findByUserIdAndLimitDateQuery({ userId });
    const knowledgeElementRows = await query.where({ assessmentId });

    const knowledgeElements = _.map(
      knowledgeElementRows,
      (knowledgeElementRow) => new KnowledgeElement(knowledgeElementRow)
    );
    return _applyFilters(knowledgeElements);
  },

  async findUniqByUserIdAndCompetenceId({
    userId,
    competenceId,
    domainTransaction = DomainTransaction.emptyTransaction(),
  }) {
    const knowledgeElements = await _findAssessedByUserIdAndLimitDateQuery({ userId, domainTransaction });
    return knowledgeElements.filter((knowledgeElement) => knowledgeElement.competenceId === competenceId);
  },

  async findUniqByUserIdGroupedByCompetenceId({ userId, limitDate }) {
    const knowledgeElements = await this.findUniqByUserId({ userId, limitDate });
    return _.groupBy(knowledgeElements, 'competenceId');
  },

  async findByCampaignIdAndUserIdForSharedCampaignParticipation({ campaignId, userId }) {
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
  },

  async findByCampaignIdForSharedCampaignParticipation(campaignId) {
    const sharedCampaignParticipations = await knex('campaign-participations')
      .select('userId', 'sharedAt')
      .where({ campaignId, status: SHARED });

    const knowledgeElements = _.flatMap(
      await bluebird.map(
        sharedCampaignParticipations,
        async ({ userId, sharedAt }) => {
          return _findAssessedByUserIdAndLimitDateQuery({ userId, limitDate: sharedAt });
        },
        { concurrency: constants.CONCURRENCY_HEAVY_OPERATIONS }
      )
    );

    return _filterValidatedKnowledgeElementsByCampaignId(knowledgeElements, campaignId);
  },

  async findSnapshotGroupedByCompetencesForUsers(userIdsAndDates) {
    const knowledgeElementsGroupedByUser = await _findSnapshotsForUsers(userIdsAndDates);

    for (const [userId, knowledgeElements] of Object.entries(knowledgeElementsGroupedByUser)) {
      knowledgeElementsGroupedByUser[userId] = _.groupBy(knowledgeElements, 'competenceId');
    }
    return knowledgeElementsGroupedByUser;
  },

  async countValidatedByCompetencesForUsersWithinCampaign(userIdsAndDates, campaignLearningContent) {
    return _countValidatedByCompetencesForUsersWithinCampaign(userIdsAndDates, campaignLearningContent);
  },

  async countValidatedByCompetencesForOneUserWithinCampaign(userId, limitDate, campaignLearningContent) {
    return _countValidatedByCompetencesForUsersWithinCampaign({ [userId]: limitDate }, campaignLearningContent);
  },

  async findGroupedByCompetencesForUsersWithinLearningContent(userIdsAndDates, campaignLearningContent) {
    const knowledgeElementsGroupedByUser = await _findSnapshotsForUsers(userIdsAndDates);
    const knowledgeElementsGroupedByUserAndCompetence = {};

    for (const [userId, knowledgeElements] of Object.entries(knowledgeElementsGroupedByUser)) {
      knowledgeElementsGroupedByUserAndCompetence[userId] =
        campaignLearningContent.getKnowledgeElementsGroupedByCompetence(knowledgeElements);
    }

    return knowledgeElementsGroupedByUserAndCompetence;
  },

  async findValidatedGroupedByTubesWithinCampaign(userIdsAndDates, campaignLearningContent) {
    const knowledgeElementsGroupedByUser = await _findSnapshotsForUsers(userIdsAndDates);

    return campaignLearningContent.getValidatedKnowledgeElementsGroupedByTube(
      _.flatMap(knowledgeElementsGroupedByUser)
    );
  },

  async findSnapshotForUsers(userIdsAndDates) {
    return _findSnapshotsForUsers(userIdsAndDates);
  },

  async findInvalidatedAndDirectByUserId(userId) {
    const invalidatedKnowledgeElements = await knex('knowledge-elements')
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
      (invalidatedKnowledgeElement) => new KnowledgeElement(invalidatedKnowledgeElement)
    );
  },
};
