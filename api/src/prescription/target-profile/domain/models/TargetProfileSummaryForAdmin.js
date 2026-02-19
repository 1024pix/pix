class TargetProfileSummaryForAdmin {
  constructor(params = {}) {
    this.id = params.id;
    this.internalName = params.internalName;
    this.outdated = params.outdated;
    this.category = params.category;
    this.createdAt = params.createdAt;
    if ('isPartOfCombinedCourse' in params) {
      this.isPartOfCombinedCourse = params.isPartOfCombinedCourse;
    }
  }
}

export { TargetProfileSummaryForAdmin };
