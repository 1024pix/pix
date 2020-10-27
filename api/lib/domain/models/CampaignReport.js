class CampaignReport {
  constructor({
    id,
    // attributes
    participationsCount,
    sharedParticipationsCount,
    stages,
  } = {}) {
    this.id = id;
    // attributes
    this.participationsCount = participationsCount;
    this.sharedParticipationsCount = sharedParticipationsCount;
    this.stages = stages;
  }
}

module.exports = CampaignReport;
