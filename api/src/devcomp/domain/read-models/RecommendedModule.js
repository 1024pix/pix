class RecommendedModule {
  constructor({ id, moduleId, shortId, campaignParticipationId } = {}) {
    this.id = id;
    this.moduleId = moduleId;
    this.shortId = shortId;
    this.campaignParticipationId = campaignParticipationId;
  }
}

export { RecommendedModule };
