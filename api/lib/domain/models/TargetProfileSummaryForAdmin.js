class TargetProfileSummaryForAdmin {
  constructor({ id, name, isPublic, outdated, createdAt } = {}) {
    this.id = id;
    this.name = name;
    this.outdated = outdated;
    this.isPublic = isPublic;
    this.createdAt = createdAt;
  }
}

export { TargetProfileSummaryForAdmin };
