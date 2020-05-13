const _ = require('lodash');
const Bookshelf = require('../bookshelf');
const KnowledgeElement = require('../../domain/models/KnowledgeElement');
const BookshelfKnowledgeElement = require('../data/knowledge-element');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const scoringService = require('../../domain/services/scoring/scoring-service');

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

async function _findByCampaignIdForSharedCampaignParticipationWhere(campaignParticipationsWhereClause) {
  const keResults = await BookshelfKnowledgeElement
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
    .fetchAll();

  return bookshelfToDomainConverter.buildDomainObjects(BookshelfKnowledgeElement, keResults);
}

function _getByUserIdAndLimitDateQuery({ userId, limitDate }) {
  return Bookshelf.knex('knowledge-elements')
    .where((qb) => {
      qb.where({ userId });
      if (limitDate) {
        qb.where('createdAt', '<', limitDate);
      }
    });
}

module.exports = {

  async save(knowledgeElement) {
    const knowledgeElementToSave = _.omit(knowledgeElement, ['id', 'createdAt']);
    const savedKnowledgeElement = await new BookshelfKnowledgeElement(knowledgeElementToSave).save();

    return bookshelfToDomainConverter.buildDomainObject(BookshelfKnowledgeElement, savedKnowledgeElement);
  },

  async findUniqByUserId({ userId, limitDate }) {
    const knowledgeElementRows = await _getByUserIdAndLimitDateQuery({ userId, limitDate });

    const knowledgeElements = _.map(knowledgeElementRows, (knowledgeElementRow) => new KnowledgeElement(knowledgeElementRow));
    return _applyFilters(knowledgeElements);
  },

  async findUniqByUserIdAndAssessmentId({ userId, assessmentId }) {
    const query = _getByUserIdAndLimitDateQuery({ userId });
    const knowledgeElementRows = await query.where({ assessmentId });

    const knowledgeElements = _.map(knowledgeElementRows, (knowledgeElementRow) => new KnowledgeElement(knowledgeElementRow));
    return _applyFilters(knowledgeElements);
  },

  async findUniqByUserIdAndCompetenceId({ userId, competenceId }) {
    const query = _getByUserIdAndLimitDateQuery({ userId });
    const knowledgeElementRows = await query.where({ competenceId });

    const knowledgeElements = _.map(knowledgeElementRows, (knowledgeElementRow) => new KnowledgeElement(knowledgeElementRow));
    return _applyFilters(knowledgeElements);
  },

  async findUniqByUserIdGroupedByCompetenceId({ userId, limitDate }) {
    const knowledgeElements = await this.findUniqByUserId({ userId, limitDate });
    return _.groupBy(knowledgeElements, 'competenceId');
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

