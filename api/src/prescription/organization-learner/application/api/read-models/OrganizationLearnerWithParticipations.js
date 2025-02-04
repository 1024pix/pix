export class OrganizationLearnerWithParticipations {
  constructor({ organizationLearner, organization, campaignParticipations, tagNames }) {
    this.organizationLearner = {
      id: organizationLearner.id,
      MEFCode: organizationLearner.MEFCode,
    };
    this.organization = {
      id: organization.id,
      isManagingStudents: organization.isManagingStudents,
      tags: tagNames,
      type: organization.type,
    };
    this.campaignParticipations = campaignParticipations.map(({ id, targetProfileId, status }) => ({
      id,
      targetProfileId,
      status,
    }));
  }
}
