class CampaignReport {
  constructor({
    id,
    // attributes
    participationsCount,
    sharedParticipationsCount,
  } = {}) {
    this.id = id;
    // attributes
    this.participationsCount = participationsCount;
    this.sharedParticipationsCount = sharedParticipationsCount;
  }
}

module.exports = CampaignReport;
