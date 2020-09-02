class CampaignAssessmentParticipationResult {

  constructor({
    campaignParticipationId,
    campaignId,
    isShared,
    competenceResults,
  }) {
    this.campaignParticipationId = campaignParticipationId;
    this.campaignId = campaignId;
    this.isShared = isShared;
    this.competenceResults = competenceResults;
  }
}

module.exports = CampaignAssessmentParticipationResult;

