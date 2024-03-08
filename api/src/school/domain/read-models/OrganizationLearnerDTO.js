class OrganizationLearnerDTO {
  constructor({ id, displayName, firstName, division, organizationId, completedMissionIds } = {}) {
    this.id = id;
    this.displayName = displayName;
    this.firstName = firstName;
    this.division = division;
    this.organizationId = organizationId;
    this.completedMissionIds = completedMissionIds;
  }
}

export { OrganizationLearnerDTO };
