const _ = require('lodash');

class CampaignCollectiveResult {
  constructor({ id, targetProfile } = {}) {
    this.id = id;
    const targetedCompetences = _.sortBy(targetProfile.competences, 'index');

    this.campaignCompetenceCollectiveResults = _.map(targetedCompetences, (targetedCompetence) => {
      const targetedArea = targetProfile.getAreaOfCompetence(targetedCompetence.id);
      return new CampaignCompetenceCollectiveResult({
        campaignId: id,
        targetedCompetence,
        targetedArea,
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
  constructor({ campaignId, targetedArea, targetedCompetence } = {}) {
    this.areaCode = targetedCompetence.index.split('.')[0];
    this.competenceId = targetedCompetence.id;
    this.id = `${campaignId}_${this.competenceId}`;
    this.competenceName = targetedCompetence.name;
    this.areaColor = targetedArea.color;
    this.targetedSkillsCount = targetedCompetence.skillCount;
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
