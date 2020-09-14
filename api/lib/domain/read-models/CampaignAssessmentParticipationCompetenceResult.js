const _ = require('lodash');

class CampaignAssessmentParticipationCompetenceResult {
  constructor({
    competence,
    targetedSkillIds = [],
    targetedKnowledgeElements = [],
  } = {}) {
    this.id = competence.id;
    this.name = competence.name;
    this.index = competence.index;
    this.areaColor = competence.area && competence.area.color;
    this.targetedSkillsCount = _.intersection(competence.skillIds, targetedSkillIds).length;
    this.validatedSkillsCount = targetedKnowledgeElements
      .filter(({ isValidated }) => isValidated)
      .map(({ skillId }) => skillId)
      .length;
  }
}

module.exports = CampaignAssessmentParticipationCompetenceResult;
