export const TYPES = {
  ORGANIZATION_LEARNER: 'organizationLearner',
  ORGANIZATION: 'organization',
  CAMPAIGN_PARTICIPATIONS: 'campaignParticipations',
};

export class Eligibility {
  constructor({ organizationLearner, organization, campaignParticipations = [] }) {
    this.organizationLearner = {
      id: organizationLearner?.id,
      MEFCode: organizationLearner?.MEFCode,
    };
    this.organization = organization;
    this.campaignParticipations = campaignParticipations;
  }

  hasCampaignParticipation(campaignParticipationId) {
    return Boolean(
      this.campaignParticipations.find((campaignParticipation) => campaignParticipation.id === campaignParticipationId),
    );
  }

  hasCampaignParticipationForTargetProfileId(targetProfileId) {
    return Boolean(
      this.campaignParticipations.find(
        (campaignParticipation) => campaignParticipation.targetProfileId === targetProfileId,
      ),
    );
  }

  getTargetProfileForCampaignParticipation(campaignParticipationId) {
    const campaignParticipation = this.campaignParticipations.find(
      (campaignParticipation) => campaignParticipation.id === campaignParticipationId,
    );

    return campaignParticipation?.targetProfileId ?? null;
  }
}
