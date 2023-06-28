class TargetProfileSummaryForAdmin {
  constructor({ id, name, outdated, createdAt } = {}) {
    this.id = id;
    this.name = name;
    this.outdated = outdated;
    this.createdAt = createdAt;
  }
}

export { TargetProfileSummaryForAdmin };
