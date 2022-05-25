class TargetedProfileTemplate {
  constructor({ id, targetProfileIds, tubes } = {}) {
    this.id = id;
    this.targetProfileIds = targetProfileIds;
    this.tubes = tubes;
  }
}

module.exports = TargetedProfileTemplate;
