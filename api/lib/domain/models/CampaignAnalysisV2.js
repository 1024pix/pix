const _ = require('lodash');
const CampaignTubeRecommendationV2 = require('./CampaignTubeRecommendationV2');

class CampaignAnalysisV2 {
  constructor({
    campaignId,
    competences,
    tubes,
    skills,
    tutorials,
  } = {}) {
    this.id = campaignId;
    this.competences = competences;
    this.tubes = tubes;
    this.skills = skills;
    this.tutorials = tutorials;
    const { difficulty: maxSkillLevelInTargetProfile } =  _.maxBy(skills, 'difficulty');
    this.campaignTubeRecommendations = _.map(tubes, (tube) => {
      const competence = _.find(competences, { id: tube.competenceId });
      const tubeSkills = _.filter(skills, { tubeId: tube.id });
      const tutorialIds = _.uniq(_.flatMap(tubeSkills, 'tutorialIds'));
      const tubeTutorials = _.filter(tutorials, (tutorial) => tutorialIds.includes(tutorial.id));
      return new CampaignTubeRecommendationV2({
        campaignId: campaignId,
        competence,
        tube,
        skills: tubeSkills,
        maxSkillLevelInTargetProfile,
        tutorials: tubeTutorials,
      });
    });
  }

  updateCampaignTubeRecommendations(validatedKnowledgeElementsByParticipant) {
    _.each(this.campaignTubeRecommendations, (campaignTubeRecommendation) => {
      const tubeSkillIds = campaignTubeRecommendation.skillIds;
      const validatedKnowledgeElementsOfTubeByParticipant = _.mapValues(validatedKnowledgeElementsByParticipant, (validatedKnowledgeElements) => {
        return _.filter(validatedKnowledgeElements, (knowledgeElement) => tubeSkillIds.includes(knowledgeElement.skillId));
      });
      campaignTubeRecommendation.updateAverageScore(validatedKnowledgeElementsOfTubeByParticipant);
    });
  }
}

module.exports = CampaignAnalysisV2;
