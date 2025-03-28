export class ParticipationStoreLevelPerTubeJob {
  constructor({ campaignId, campaignParticipationId, locale }) {
    this.campaignParticipationId = campaignParticipationId;
    this.campaignId = campaignId;
    this.locale = locale;
  }
}
