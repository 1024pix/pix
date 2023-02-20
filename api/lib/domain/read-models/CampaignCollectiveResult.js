import _ from 'lodash';

class CampaignCollectiveResult {
  constructor({ id, campaignLearningContent } = {}) {
    this.id = id;
    const competences = _.sortBy(campaignLearningContent.competences, 'index');

    this.campaignCompetenceCollectiveResults = competences.map((competence) => {
      const area = campaignLearningContent.findAreaOfCompetence(competence);
      return new CampaignCompetenceCollectiveResult({
        campaignId: id,
        competence,
        area,
      });
    });
  }

  addValidatedSkillCountToCompetences(participantsKECountByCompetenceId) {
    _.each(this.campaignCompetenceCollectiveResults, (campaignCompetenceCollectiveResult) => {
      const competenceId = campaignCompetenceCollectiveResult.competenceId;
      if (competenceId in participantsKECountByCompetenceId) {
        campaignCompetenceCollectiveResult.addValidatedSkillCount(participantsKECountByCompetenceId[competenceId]);
      }
    });
  }

  finalize(participantCount) {
    _.each(this.campaignCompetenceCollectiveResults, (campaignCompetenceCollectiveResult) => {
      campaignCompetenceCollectiveResult.finalize(participantCount);
    });
  }
}

class CampaignCompetenceCollectiveResult {
  constructor({ campaignId, area, competence } = {}) {
    this.areaCode = competence.index.split('.')[0];
    this.competenceId = competence.id;
    this.id = `${campaignId}_${this.competenceId}`;
    this.competenceName = competence.name;
    this.areaColor = area.color;
    this.targetedSkillsCount = competence.skillCount;
    this.validatedSkillCount = 0;
    this.averageValidatedSkills = 0;
  }

  addValidatedSkillCount(validatedSkillCount) {
    this.validatedSkillCount += validatedSkillCount;
  }

  finalize(participantCount) {
    if (participantCount) {
      this.averageValidatedSkills = this.validatedSkillCount / participantCount;
    }
  }
}

export default CampaignCollectiveResult;
