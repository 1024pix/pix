const _ = require('lodash');
const CampaignCompetenceCollectiveResultProgressive = require('./CampaignCompetenceCollectiveResultProgressive');

class CampaignCollectiveResultProgressive {

  constructor({
    id,
    targetProfile,
  } = {}) {
    this.id = id;
    let targetedCompetences = targetProfile.competences;
    targetedCompetences = _.sortBy(targetedCompetences, 'index');

    this.campaignCompetenceCollectiveResults = _.map(targetedCompetences, (targetedCompetence) => {
      const targetedArea = targetProfile.getAreaOfCompetence(targetedCompetence.id);
      return new CampaignCompetenceCollectiveResultProgressive({
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

module.exports = CampaignCollectiveResultProgressive;
