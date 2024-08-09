export class OrganizationLearnerWithParticipations {
  constructor({ organizationLearner, organization, participations, tagNames }) {
    this.organizationLearner = {
      id: organizationLearner.id,
      MEFCode: organizationLearner.MEFCode,
    };
    this.organization = {
      isManagingStudents: organization.isManagingStudents,
      tags: tagNames,
      type: organization.type,
    };
    this.participations = participations.map(({ targetProfileId }) => ({ targetProfileId }));
  }
}
