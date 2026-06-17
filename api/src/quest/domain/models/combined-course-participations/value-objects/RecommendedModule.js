export class RecommendedModule {
  constructor({ id, targetProfileIds, moduleId }) {
    this.id = id;
    this.moduleId = moduleId;
    this.targetProfileIds = targetProfileIds;
  }
}
