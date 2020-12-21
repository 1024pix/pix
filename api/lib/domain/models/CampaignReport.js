class CampaignReport {
  constructor({
    id,
    participationsCount,
    sharedParticipationsCount,
    stages,
  } = {}) {
    this.id = id;
    this.participationsCount = participationsCount;
    this.sharedParticipationsCount = sharedParticipationsCount;
    this.stages = stages;
  }
}

module.exports = CampaignReport;
