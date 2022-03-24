const map = require('lodash/map');
const isEmpty = require('lodash/isEmpty');
const Scorecard = require('./Scorecard');

class SharedProfileForCampaign {
  constructor({
    campaignParticipation,
    campaignAllowsRetry,
    isRegistrationActive,
    competencesWithArea,
    knowledgeElementsGroupedByCompetenceId,
    userId,
  }) {
    this.id = campaignParticipation?.id;
    this.sharedAt = campaignParticipation?.sharedAt;
    this.pixScore = campaignParticipation?.pixScore || 0;
    this.scorecards = this._buildScorecards(userId, competencesWithArea, knowledgeElementsGroupedByCompetenceId);
    this.canRetry = this._computeCanRetry(
      campaignAllowsRetry,
      this.sharedAt,
      isRegistrationActive,
      campaignParticipation?.deletedAt
    );
  }

  _buildScorecards(userId, competencesWithArea, knowledgeElementsGroupedByCompetenceId) {
    if (isEmpty(knowledgeElementsGroupedByCompetenceId)) return [];
    return map(competencesWithArea, (competence) => {
      const competenceId = competence.id;
      const knowledgeElements = knowledgeElementsGroupedByCompetenceId[competenceId];

      return Scorecard.buildFrom({
        userId,
        knowledgeElements,
        competence,
      });
    });
  }

  _computeCanRetry(campaignAllowsRetry, sharedAt, isRegistrationActive, deletedAt) {
    return campaignAllowsRetry && Boolean(sharedAt) && isRegistrationActive && !deletedAt;
  }
}

module.exports = SharedProfileForCampaign;
