export class Eligibility {
  constructor({ organizationLearner, organization, campaignParticipations = [] }) {
    this.organizationLearner = {
      MEFCode: organizationLearner?.MEFCode,
    };
    this.organization = organization;
    this.campaignParticipations = {
      targetProfileIds: campaignParticipations.map(({ targetProfileId }) => targetProfileId),
    };
  }
}
