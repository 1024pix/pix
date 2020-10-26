const _ = require('lodash');
const CampaignTubeRecommendation = require('./CampaignTubeRecommendation');

class CampaignAnalysis {

  constructor({
    campaignId,
    targetProfile,
    validatedKnowledgeElementsByTube,
    participantsCount,
    tutorials,
  } = {}) {
    this.id = campaignId;
    this.campaignTubeRecommendations = this._buildCampaignTubeRecommendations({ campaignId, targetProfile, validatedKnowledgeElementsByTube, participantsCount, tutorials });
  }

  _buildCampaignTubeRecommendations({ campaignId, targetProfile, validatedKnowledgeElementsByTube, participantsCount, tutorials }) {
    const maxSkillLevelInTargetProfile = targetProfile.maxSkillDifficulty;
    return targetProfile.tubes.map((tube) => {
      const competence = targetProfile.getCompetence(tube.competenceId);
      const area = targetProfile.getArea(competence.areaId);
      const validatedKnowledgeElementsOfTube = validatedKnowledgeElementsByTube[tube.id];
      const tutorialIds = _.uniq(_.flatMap(tube.skills, 'tutorialIds'));
      const tubeTutorials = _.filter(tutorials, (tutorial) => tutorialIds.includes(tutorial.id));
      return new CampaignTubeRecommendation({
        campaignId: campaignId,
        area,
        competence,
        tube,
        validatedKnowledgeElements: validatedKnowledgeElementsOfTube,
        participantsCount,
        maxSkillLevelInTargetProfile,
        tutorials: tubeTutorials,
      });
    });
  }
}

module.exports = CampaignAnalysis;
