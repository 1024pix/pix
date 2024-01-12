class CampaignParticipationKnowledgeElementSnapshots {
  constructor({ userId, snappedAt, knowledgeElements } = {}) {
    this.userId = userId;
    this.snappedAt = snappedAt;
    this.knowledgeElements = knowledgeElements;
  }
}

export { CampaignParticipationKnowledgeElementSnapshots };
