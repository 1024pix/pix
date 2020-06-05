const _ = require('lodash');
const { knex } = require('../bookshelf');
const KnowledgeElement = require('../../domain/models/KnowledgeElement');
const BookshelfKnowledgeElement = require('../data/knowledge-element');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');

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

async function _findByCampaignIdForSharedCampaignParticipation({ campaignId, userId }) {
  const keResults = await BookshelfKnowledgeElement
    .query((qb) => {
      qb.select('knowledge-elements.*');
      qb.innerJoin('campaign-participations', function() {
        this.on('campaign-participations.userId', '=', 'knowledge-elements.userId')
          .andOn('knowledge-elements.createdAt', '<', 'campaign-participations.sharedAt');
      });
      qb.leftJoin('campaigns', 'campaigns.id', 'campaign-participations.campaignId');
      qb.innerJoin('target-profiles_skills', function() {
        this.on('target-profiles_skills.targetProfileId', '=', 'campaigns.targetProfileId')
          .andOn('target-profiles_skills.skillId', '=', 'knowledge-elements.skillId');
      });
    })
    .where((qb) => {
      qb.where({ 'campaign-participations.isShared': true });
      qb.where({ status: 'validated' });
      qb.where({ 'campaign-participations.campaignId': campaignId });
      if (userId) {
        qb.where({ 'campaign-participations.userId': userId });
      }
    })
    .fetchAll();

  const knowledgeElements = bookshelfToDomainConverter.buildDomainObjects(BookshelfKnowledgeElement, keResults);

  return _applyFilters(knowledgeElements);
}

function _getByUserIdAndLimitDateQuery({ userId, limitDate }) {
  return knex('knowledge-elements')
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

  findByCampaignIdAndUserIdForSharedCampaignParticipation({ campaignId, userId }) {
    return _findByCampaignIdForSharedCampaignParticipation({ campaignId, userId });
  },

  findByCampaignIdForSharedCampaignParticipation(campaignId) {
    return _findByCampaignIdForSharedCampaignParticipation({ campaignId, userId: null });
  }
};

