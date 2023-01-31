const map = require('lodash/map');
const isEmpty = require('lodash/isEmpty');
const Scorecard = require('../models/Scorecard');

class SharedProfileForCampaign {
  constructor({
    campaignParticipation,
    campaignAllowsRetry,
    isOrganizationLearnerActive,
    competences,
    knowledgeElementsGroupedByCompetenceId,
    userId,
    allAreas,
    maxReachableLevel,
    maxReachablePixScore,
  }) {
    this.id = campaignParticipation?.id;
    this.sharedAt = campaignParticipation?.sharedAt;
    this.pixScore = campaignParticipation?.pixScore || 0;
    this.scorecards = this._buildScorecards(userId, competences, allAreas, knowledgeElementsGroupedByCompetenceId);
    this.canRetry = this._computeCanRetry(
      campaignAllowsRetry,
      this.sharedAt,
      isOrganizationLearnerActive,
      campaignParticipation?.deletedAt
    );
    this.maxReachableLevel = maxReachableLevel;
    this.maxReachablePixScore = maxReachablePixScore;
  }

  _buildScorecards(userId, competences, allAreas, knowledgeElementsGroupedByCompetenceId) {
    if (isEmpty(knowledgeElementsGroupedByCompetenceId)) return [];
    return map(competences, (competence) => {
      const competenceId = competence.id;
      const area = allAreas.find((area) => area.id === competence.areaId);
      const knowledgeElements = knowledgeElementsGroupedByCompetenceId[competenceId];

      return Scorecard.buildFrom({
        userId,
        knowledgeElements,
        competence,
        area,
      });
    });
  }

  _computeCanRetry(campaignAllowsRetry, sharedAt, isOrganizationLearnerActive, deletedAt) {
    return campaignAllowsRetry && Boolean(sharedAt) && isOrganizationLearnerActive && !deletedAt;
  }
}

module.exports = SharedProfileForCampaign;
