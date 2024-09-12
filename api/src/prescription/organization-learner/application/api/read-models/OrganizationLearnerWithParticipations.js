export class OrganizationLearnerWithParticipations {
  constructor({ organizationLearner, organization, campaignParticipations, tagNames }) {
    this.organizationLearner = {
      id: organizationLearner.id,
      MEFCode: organizationLearner.MEFCode,
    };
    this.organization = {
      isManagingStudents: organization.isManagingStudents,
      tags: tagNames,
      type: organization.type,
    };
    this.campaignParticipations = campaignParticipations.map(({ targetProfileId }) => ({ targetProfileId }));
  }
}
