const _ = require('lodash');
const recommendationService = require('../services/recommendation-service.js');

class CampaignAnalysis {
  constructor({ campaignId, campaignLearningContent, tutorials, participantCount = 0 } = {}) {
    this.id = campaignId;
    this.participantCount = participantCount;
    const maxSkillLevel = campaignLearningContent.maxSkillDifficulty;
    this.campaignTubeRecommendations = campaignLearningContent.tubes.map((tube) => {
      const competence = campaignLearningContent.findCompetence(tube.competenceId);
      const area = campaignLearningContent.findAreaOfCompetence(competence);
      const tutorialIds = _.uniq(_.flatMap(tube.skills, 'tutorialIds'));
      const tubeTutorials = _.filter(tutorials, (tutorial) => tutorialIds.includes(tutorial.id));
      return new CampaignTubeRecommendation({
        campaignId: campaignId,
        area,
        competence,
        tube,
        maxSkillLevel,
        tutorials: tubeTutorials,
        participantCount: this.participantCount,
      });
    });
  }

  addToTubeRecommendations({ knowledgeElementsByTube = {} }) {
    this.campaignTubeRecommendations.forEach((campaignTubeRecommendation) => {
      const tubeId = campaignTubeRecommendation.tubeId;
      if (tubeId in knowledgeElementsByTube) {
        campaignTubeRecommendation.add({ knowledgeElements: knowledgeElementsByTube[tubeId] });
      }
    });
  }

  finalize() {
    this.campaignTubeRecommendations.forEach((campaignTubeRecommendation) => {
      campaignTubeRecommendation.finalize();
    });
  }
}

class CampaignTubeRecommendation {
  constructor({ campaignId, area, tube, competence, maxSkillLevel, tutorials, participantCount = 0 } = {}) {
    this.campaignId = campaignId;
    this.tube = tube;
    this.competenceId = competence.id;
    this.competenceName = competence.name;
    this.areaColor = area.color;
    this.maxSkillLevel = maxSkillLevel;
    this.tutorials = tutorials;
    this.participantCount = participantCount;
    this.cumulativeScore = 0;
    this.cumulativeParticipantCount = 0;
    this.averageScore = null;
  }

  get tubeId() {
    return this.tube.id;
  }

  get tubePracticalTitle() {
    return this.tube.practicalTitle;
  }

  get tubeDescription() {
    return this.tube.practicalDescription;
  }

  get id() {
    return `${this.campaignId}_${this.tubeId}`;
  }

  add({ knowledgeElements = [] }) {
    const knowledgeElementsByParticipant = _.toArray(_.groupBy(knowledgeElements, 'userId'));
    this._computeCumulativeScore(knowledgeElementsByParticipant);
    this.cumulativeParticipantCount += knowledgeElementsByParticipant.length;
  }

  finalize() {
    if (this.participantCount > 0) {
      const participantCountWithoutKnowledgeElements = this.participantCount - this.cumulativeParticipantCount;
      const emptyKnowledgeElementsByParticipant = _.times(participantCountWithoutKnowledgeElements, () => []);
      this._computeCumulativeScore(emptyKnowledgeElementsByParticipant);
      this.averageScore = this.cumulativeScore / this.participantCount;
    }
  }

  _computeCumulativeScore(knowledgeElementsByParticipant) {
    this.cumulativeScore += _(knowledgeElementsByParticipant).sumBy((knowledgeElements) =>
      recommendationService.computeRecommendationScore(this.tube.skills, this.maxSkillLevel, knowledgeElements)
    );
  }
}

module.exports = CampaignAnalysis;
