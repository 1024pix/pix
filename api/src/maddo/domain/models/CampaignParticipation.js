class CampaignParticipation {
  constructor({
    id,
    createdAt,
    participantExternalId,
    status,
    sharedAt,
    campaignId,
    userId,
    organizationLearnerId,
    tubesReachedLevel,
  } = {}) {
    this.id = id;
    this.createdAt = createdAt;
    this.status = status;
    this.participantExternalId = participantExternalId;
    this.sharedAt = sharedAt;
    this.campaignId = campaignId;
    this.userId = userId;
    this.status = status;
    this.organizationLearnerId = organizationLearnerId;
    this.tubesReachedLevel = tubesReachedLevel?.map((tubeReachedLevel) => new TubeReachedLevel(tubeReachedLevel));
  }
}

export { CampaignParticipation };

class TubeReachedLevel {
  constructor({ id, name, level }) {
    this.id = id;
    this.name = name;
    this.level = level;
  }
}
