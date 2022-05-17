class TargetedProfileTemplate {
  constructor({ id, targetProfiles, tubes } = {}) {
    this.id = id;
    this.targetProfiles = targetProfiles;
    this.tubes = tubes;
  }
}

module.exports = TargetedProfileTemplate;
