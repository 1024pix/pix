export type CampaignSharedEventProps = {
  campaignId: number;
  campaignParticipationId: number;
  userId: number;
  sharedAt: Date;
};

export class CampaignSharedEvent {
  #campaignId: number;
  #campaignParticipationId: number;
  #userId: number;
  #sharedAt: Date;

  constructor({ campaignId, campaignParticipationId, userId, sharedAt }: CampaignSharedEventProps) {
    this.#campaignId = campaignId;
    this.#campaignParticipationId = campaignParticipationId;
    this.#userId = userId;
    this.#sharedAt = sharedAt;
  }

  static get eventName() {
    return 'campaign-participation.shared';
  }

  get eventName() {
    return CampaignSharedEvent.eventName;
  }

  get payload() {
    return {
      campaignId: this.#campaignId,
      campaignParticipationId: this.#campaignParticipationId,
      userId: this.#userId,
      sharedAt: this.#sharedAt,
    };
  }
}
