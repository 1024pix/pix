const recommendationService = require('../services/recommendation-service');

const _ = require('lodash');

class CampaignTubeRecommendation {

  constructor({
    // attributes
    campaignId,
    tube,
    competence,
    skills,
    validatedKnowledgeElements,
    participantsCount,
    maxSkillLevelInTargetProfile,
    tutorials,
  } = {}) {
    // attributes
    this.campaignId = campaignId;
    this.tubeId = tube.id;
    this.competenceId = competence.id;
    this.competenceName = competence.name;
    this.tubePracticalTitle = tube.practicalTitle;
    this.areaColor = competence.area.color;
    this.averageScore = null;
    if (participantsCount) {
      this.averageScore = this._computeAverageScore(validatedKnowledgeElements, skills, participantsCount, maxSkillLevelInTargetProfile);
    }
    this.tutorials = tutorials;
  }

  get id() {
    return `${this.campaignId}_${this.tubeId}`;
  }

  _computeAverageScore(validatedKnowledgeElements, skills, participantsCount, maxSkillLevelInTargetProfile) {

    const knowledgeElementsByParticipants = this._knowledgeElementsByParticipant(validatedKnowledgeElements, participantsCount);

    const sumOfScores = _(knowledgeElementsByParticipants)
      .values()
      .sumBy((knowledgeElements) =>
        recommendationService.computeRecommendationScore(
          skills,
          maxSkillLevelInTargetProfile,
          knowledgeElements
        ));

    return sumOfScores / participantsCount;

  }

  _knowledgeElementsByParticipant(validatedKnowledgeElements, participantsCount) {
    const knowledgeElementsByParticipant = _.toArray(_.groupBy(validatedKnowledgeElements, 'userId'));

    const participantsCountWithoutKnowledgeElements = participantsCount - knowledgeElementsByParticipant.length;
    _.times(participantsCountWithoutKnowledgeElements, () => knowledgeElementsByParticipant.push([]));
    return knowledgeElementsByParticipant;
  }
}

module.exports = CampaignTubeRecommendation;
