export class Eligibility {
  #campaignParticipations;

  constructor({ organizationLearner, organization, campaignParticipations = [] }) {
    this.organizationLearner = {
      MEFCode: organizationLearner?.MEFCode,
    };
    this.organization = organization;
    this.#campaignParticipations = campaignParticipations;
  }

  get campaignParticipations() {
    return {
      targetProfileIds: this.#campaignParticipations.map(({ targetProfileId }) => targetProfileId),
    };
  }

  hasCampaignParticipation(campaignParticipationId) {
    return Boolean(
      this.#campaignParticipations.find(
        (campaignParticipation) => campaignParticipation.id === campaignParticipationId,
      ),
    );
  }

  getTargetProfileForCampaignParticipation(campaignParticipationId) {
    const campaignParticipation = this.#campaignParticipations.find(
      (campaignParticipation) => campaignParticipation.id === campaignParticipationId,
    );

    return campaignParticipation?.targetProfileId ?? null;
  }
}
