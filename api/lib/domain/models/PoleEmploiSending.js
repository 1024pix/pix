const TYPES = {
  CAMPAIGN_PARTICIPATION_START: 'CAMPAIGN_PARTICIPATION_START',
  CAMPAIGN_PARTICIPATION_COMPLETION: 'CAMPAIGN_PARTICIPATION_COMPLETION',
  CAMPAIGN_PARTICIPATION_SHARING: 'CAMPAIGN_PARTICIPATION_SHARING',
};

class PoleEmploiSending {
  constructor({ campaignParticipationId, type, payload, isSuccessful, responseCode }) {
    this.campaignParticipationId = campaignParticipationId;
    this.type = type;
    this.isSuccessful = isSuccessful;
    this.responseCode = responseCode;
    this.payload = payload;
  }

  static buildForParticipationStarted({ campaignParticipationId, payload, isSuccessful, responseCode }) {
    return new PoleEmploiSending({
      campaignParticipationId,
      type: TYPES.CAMPAIGN_PARTICIPATION_START,
      payload,
      isSuccessful,
      responseCode,
    });
  }

  static buildForParticipationFinished({ campaignParticipationId, payload, isSuccessful, responseCode }) {
    return new PoleEmploiSending({
      campaignParticipationId,
      type: TYPES.CAMPAIGN_PARTICIPATION_COMPLETION,
      payload,
      isSuccessful,
      responseCode,
    });
  }

  static buildForParticipationShared({ campaignParticipationId, payload, isSuccessful, responseCode }) {
    return new PoleEmploiSending({
      campaignParticipationId,
      type: TYPES.CAMPAIGN_PARTICIPATION_SHARING,
      payload,
      isSuccessful,
      responseCode,
    });
  }
}

PoleEmploiSending.TYPES = TYPES;
export default PoleEmploiSending;
