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
    participantsCount,
    tutorials,
  } = {}) {
    this.id = campaignId;
    // attributes
    this.campaignTubeRecommendations = this._buildCampaignTubeRecommandations({ campaignId, competences, tubes, skills, validatedKnowledgeElements, participantsCount, tutorials });
  }

  _buildCampaignTubeRecommandations({ campaignId, competences, tubes, skills, validatedKnowledgeElements, participantsCount, tutorials }) {
    const { difficulty: maxSkillLevelInTargetProfile } =  _.maxBy(skills, 'difficulty');
    return tubes.map((tube) => {
      const competence = _.find(competences, { id: tube.competenceId });
      const tubeSkills = _.filter(skills, { tubeId: tube.id });
      const tubeSkillIds = _.map(tubeSkills, ({ id }) => id);
      const validatedKnowledgeElementsOfTube = _.filter(validatedKnowledgeElements, (knowledgeElement) => tubeSkillIds.includes(knowledgeElement.skillId));
      const tutorialIds = _.uniq(_.flatMap(tubeSkills, 'tutorialIds'));
      const tubeTutorials = _.filter(tutorials, (tutorial) => tutorialIds.includes(tutorial.id));
      return new CampaignTubeRecommendation({
        campaignId: campaignId,
        competence,
        tube,
        skills: tubeSkills,
        validatedKnowledgeElements: validatedKnowledgeElementsOfTube,
        participantsCount,
        maxSkillLevelInTargetProfile,
        tutorials: tubeTutorials,
      });
    });
  }
}

module.exports = CampaignAnalysis;
