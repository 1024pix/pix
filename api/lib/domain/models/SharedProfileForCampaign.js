const map = require('lodash/map');
const isEmpty = require('lodash/isEmpty');
const Scorecard = require('./Scorecard');
const { NoCampaignParticipationForUserAndCampaign } = require('../errors');

class SharedProfileForCampaign {
  constructor({ campaignParticipation }) {
    if (!campaignParticipation) {
      throw new NoCampaignParticipationForUserAndCampaign();
    }

    this.id = campaignParticipation.id;
    this.sharedAt = campaignParticipation.sharedAt;
    this.pixScore = campaignParticipation.pixScore || 0;
  }

  build({
    campaignAllowsRetry,
    isRegistrationActive,
    competencesWithArea,
    knowledgeElementsGroupedByCompetenceId,
    userId,
    deletedAt,
  }) {
    this.scorecards = this._buildScorecards(userId, competencesWithArea, knowledgeElementsGroupedByCompetenceId);
    this.canRetry = this._computeCanRetry(campaignAllowsRetry, this.sharedAt, isRegistrationActive, deletedAt);
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
