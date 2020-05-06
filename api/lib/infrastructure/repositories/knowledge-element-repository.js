const KnowledgeElement = require('../../domain/models/KnowledgeElement');
const BookshelfKnowledgeElement = require('../data/knowledge-element');
const _ = require('lodash');
const Bookshelf = require('../bookshelf');
const scoringService = require('../../domain/services/scoring/scoring-service');

function _toDomain(knowledgeElementBookshelf) {
  const knowledgeElements = knowledgeElementBookshelf.toJSON();
  return _.isArray(knowledgeElements)
    ? knowledgeElements.map((ke) => new KnowledgeElement(ke))
    : new KnowledgeElement(knowledgeElements);
}

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

function _findByCampaignIdForSharedCampaignParticipationWhere(campaignParticipationsWhereClause) {
  return BookshelfKnowledgeElement
    .query((qb) => {
      qb.select('knowledge-elements.*');
      qb.leftJoin('campaign-participations', 'campaign-participations.userId', 'knowledge-elements.userId');
      qb.leftJoin('campaigns', 'campaigns.id', 'campaign-participations.campaignId');
      qb.innerJoin('target-profiles_skills', function() {
        this.on('target-profiles_skills.targetProfileId', '=', 'campaigns.targetProfileId')
          .andOn('target-profiles_skills.skillId', '=', 'knowledge-elements.skillId');
      });
    })
    .where({ 'campaign-participations.isShared': true })
    .where(campaignParticipationsWhereClause)
    .where({ status: 'validated' })
    .fetchAll()
    .then(_toDomain);
}

function _getByUserIdAndLimitDateQuery({ userId, limitDate }) {
  return Bookshelf.knex
    .select('*', Bookshelf.knex.raw('ROW_NUMBER() OVER (PARTITION BY ?? ORDER BY ?? DESC) AS rank', ['skillId', 'createdAt']))
    .from('knowledge-elements')
    .where((qb) => {
      qb.where({ userId });
      if (limitDate) {
        qb.where('createdAt', '<', limitDate);
      }
    });
}

module.exports = {

  async save(knowledgeElement) {
    const keToSave = _.omit(knowledgeElement, ['id', 'createdAt']);
    const savedKe = await new BookshelfKnowledgeElement(keToSave).save();

    return _toDomain(savedKe);
  },

  async findUniqByUserId({ userId, limitDate }) {
    const keRows = await _getByUserIdAndLimitDateQuery({ userId, limitDate });

    const knowledgeElements = _.map(keRows, (keRow) => new KnowledgeElement(keRow));
    return _applyFilters(knowledgeElements);
  },

  findUniqByUserIdAndAssessmentId({ userId, assessmentId }) {
    return BookshelfKnowledgeElement
      .query((qb) => {
        qb.where({ userId, assessmentId });
      })
      .fetchAll()
      .then(_toDomain)
      .then(_getUniqMostRecents)
      .then(_dropResetKnowledgeElements);
  },

  findUniqByUserIdAndCompetenceId({ userId, competenceId }) {
    return BookshelfKnowledgeElement
      .where({ userId, competenceId })
      .fetchAll()
      .then(_toDomain)
      .then(_getUniqMostRecents)
      .then(_dropResetKnowledgeElements);
  },

  findUniqByUserIdGroupedByCompetenceId({ userId, limitDate }) {
    return this.findUniqByUserId({ userId, limitDate })
      .then(_dropResetKnowledgeElements)
      .then((knowledgeElements) => _.groupBy(knowledgeElements, 'competenceId'));
  },

  getSumOfPixFromUserKnowledgeElements(userId) {
    return Bookshelf.knex.with('earnedPixWithRankPerSkill',
      (qb) => {
        qb.select('earnedPix', Bookshelf.knex.raw('ROW_NUMBER() OVER (PARTITION BY ?? ORDER BY ?? DESC) AS rank', ['skillId', 'createdAt']), 'competenceId')
          .from('knowledge-elements')
          .where({ userId });
      })
      .sum('earnedPix AS earnedPix')
      .from('earnedPixWithRankPerSkill')
      .where({ rank: 1 })
      .groupBy('competenceId')
      .then((pixEarnedByCompetence) => {
        const pixScoreByCompetence = _.map(pixEarnedByCompetence, (pixEarnedForOneCompetence) =>  pixEarnedForOneCompetence.earnedPix);
        return scoringService.totalUserPixScore(pixScoreByCompetence);
      });
  },

  findByCampaignIdAndUserIdForSharedCampaignParticipation({ campaignId, userId }) {
    return _findByCampaignIdForSharedCampaignParticipationWhere({
      'campaign-participations.campaignId': campaignId,
      'campaign-participations.userId': userId,
    });
  },

  findByCampaignIdForSharedCampaignParticipation(campaignId) {
    return _findByCampaignIdForSharedCampaignParticipationWhere({
      'campaign-participations.campaignId': campaignId
    });
  }
};

