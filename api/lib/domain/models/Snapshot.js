class Snapshot {

  constructor({
    id,
    // attributes
    score,
    profile,
    studentCode,
    campaignCode,
    testsFinished,
    createdAt,
    // includes
    user,
    organization,
    // references
  } = {}) {
    this.id = id;
    // attributes
    this.score = score,
    this.profile = profile,
    this.studentCode = studentCode,
    this.campaignCode = campaignCode,
    this.testsFinished = testsFinished,
    this.createdAt = createdAt,
    // includes
    this.user = user;
    this.organization = organization;
    // references
  }
}

module.exports = Snapshot;
