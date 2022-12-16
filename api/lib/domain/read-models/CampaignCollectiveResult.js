const _ = require('lodash');

class CampaignCollectiveResult {
  constructor({ id, learningContent } = {}) {
    this.id = id;
    const competences = _.sortBy(learningContent.competences, 'index');

    this.campaignCompetenceCollectiveResults = competences.map(
      (competence) =>
        new CampaignCompetenceCollectiveResult({
          campaignId: id,
          competence,
          area: competence.area,
        })
    );
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

module.exports = CampaignCollectiveResult;
