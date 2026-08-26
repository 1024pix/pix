import lodash from 'lodash';

const { map } = lodash;

import { Scorecard } from '../../../../evaluation/domain/models/Scorecard.js';

class SharedProfileForCampaign {
  constructor({
    campaignParticipation,
    campaignAllowsRetry,
    isOrganizationLearnerActive,
    competences,
    knowledgeState,
    userId,
    allAreas,
    maxReachableLevel,
    maxReachablePixScore,
  }) {
    this.id = campaignParticipation?.id;
    this.sharedAt = campaignParticipation?.sharedAt;
    this.pixScore = campaignParticipation?.pixScore || 0;
    this.scorecards = this._buildScorecards(userId, competences, allAreas, knowledgeState);
    this.canRetry = this._computeCanRetry(
      campaignAllowsRetry,
      this.sharedAt,
      isOrganizationLearnerActive,
      campaignParticipation?.deletedAt,
    );
    this.maxReachableLevel = maxReachableLevel;
    this.maxReachablePixScore = maxReachablePixScore;
  }

  _buildScorecards(userId, competences, allAreas, knowledgeState) {
    if (knowledgeState.isEmpty) return [];
    return map(competences, (competence) => {
      const area = allAreas.find((area) => area.id === competence.areaId);

      return Scorecard.buildFrom({
        userId,
        knowledgeState: knowledgeState.restrictedToCompetence(competence.id),
        competence,
        area,
      });
    });
  }

  _computeCanRetry(campaignAllowsRetry, sharedAt, isOrganizationLearnerActive, deletedAt) {
    return campaignAllowsRetry && Boolean(sharedAt) && isOrganizationLearnerActive && !deletedAt;
  }
}

export { SharedProfileForCampaign };
