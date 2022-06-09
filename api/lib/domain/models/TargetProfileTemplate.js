class TargetProfileTemplate {
  constructor({ id, targetProfileIds, tubes } = {}) {
    this.id = id;
    this.targetProfileIds = targetProfileIds;
    this.tubes = tubes;
  }
}

module.exports = TargetProfileTemplate;
