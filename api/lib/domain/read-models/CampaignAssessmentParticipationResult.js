const _ = require('lodash');
const CampaignAssessmentParticipationCompetenceResult = require('./CampaignAssessmentParticipationCompetenceResult');

class CampaignAssessmentParticipationResult {
  constructor({
    campaignParticipationId,
    campaignId,
    isShared,
    competences,
    knowledgeElementsByCompetenceId = {},
    targetedSkillIds,
  }) {
    this.campaignParticipationId = campaignParticipationId;
    this.campaignId = campaignId;
    this.isShared = isShared;

    this.competenceResults = competences
      .filter((competence) => {
        return this.isShared && _.intersection(competence.skillIds, targetedSkillIds).length > 0;
      })
      .map((competence) => {
        const targetedKnowledgeElements = knowledgeElementsByCompetenceId[competence.id].filter((ke) =>{
          return targetedSkillIds.includes(ke.skillId);
        });
        return new CampaignAssessmentParticipationCompetenceResult({
          competence,
          targetedSkillIds,
          targetedKnowledgeElements,
        });
      });
  }
}

module.exports = CampaignAssessmentParticipationResult;
