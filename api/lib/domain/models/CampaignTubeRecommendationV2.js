const _ = require('lodash');
const recommendationService = require('../services/recommendation-service');

class CampaignTubeRecommendationV2 {
  constructor({
    campaignId,
    competence,
    tube,
    skills,
    tutorials,
    maxSkillLevelInTargetProfile,
  } = {}) {
    this.campaignId = campaignId;
    this.competenceId = competence.id;
    this.competenceName = competence.name;
    this.areaColor = competence.area.color;
    this.tubeId = tube.id;
    this.tubePracticalTitle = tube.practicalTitle;
    this.tutorials = tutorials;
    this.skills = skills;
    this.skillIds = _.map(this.skills, 'id');
    this.maxSkillLevelInTargetProfile = maxSkillLevelInTargetProfile;
    this.averageScore = null;
    this.participantCountSoFar = 0;
  }

  get id() {
    return `${this.campaignId}_${this.tubeId}`;
  }

  updateAverageScore(validatedKnowledgeElementsByParticipant) {
    const incomingParticipantCount = _.keys(validatedKnowledgeElementsByParticipant).length;
    if (incomingParticipantCount === 0) {
      return this.averageScore;
    }

    const sumOfIncomingScores = _(validatedKnowledgeElementsByParticipant)
      .values()
      .sumBy((knowledgeElements) =>
        recommendationService.computeRecommendationScore(
          this.skills,
          this.maxSkillLevelInTargetProfile,
          knowledgeElements
        ));

    const partialAverage = sumOfIncomingScores / incomingParticipantCount;
    const actualParticipantCount = this.participantCountSoFar;
    this.participantCountSoFar = this.participantCountSoFar + incomingParticipantCount;
    this.averageScore = ((this.averageScore * actualParticipantCount) + (partialAverage * incomingParticipantCount)) / this.participantCountSoFar;
  }
}

module.exports = CampaignTubeRecommendationV2;
