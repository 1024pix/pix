const CampaignTubeRecommendation = require('./CampaignTubeRecommendation');

const _ = require('lodash');

class CampaignAnalysis {

  constructor({
    campaignId,
    // attributes
    tubes,
    competences,
    skills,
    validatedKnowledgeElements,
    participantsCount
  } = {}) {
    this.id = campaignId;
    // attributes
    this.campaignTubeRecommendations = this._buildCampaignTubeRecommandations(campaignId, competences, tubes, skills, validatedKnowledgeElements, participantsCount);
  }

  _buildCampaignTubeRecommandations(campaignId, competences, tubes, skills, validatedKnowledgeElements, participantsCount) {
    const { difficulty: maxSkillLevelInTargetProfile } =  _.maxBy(skills, 'difficulty');
    return tubes.map((tube) => {
      const competence = _.find(competences, { id: tube.competenceId });
      const tubeSkills = _.filter(skills, { tubeId: tube.id });
      const tubeSkillIds = _.map(tubeSkills, ({ id }) => id);
      const validatedKnowledgeElementsOfTube = _.filter(validatedKnowledgeElements, (knowledgeElement) => tubeSkillIds.includes(knowledgeElement.skillId));

      return new CampaignTubeRecommendation({
        campaignId: campaignId,
        competence,
        tube,
        skills: tubeSkills,
        validatedKnowledgeElements: validatedKnowledgeElementsOfTube,
        participantsCount,
        maxSkillLevelInTargetProfile,
      });
    });
  }
}

module.exports = CampaignAnalysis;
