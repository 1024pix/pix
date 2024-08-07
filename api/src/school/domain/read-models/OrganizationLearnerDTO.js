class OrganizationLearnerDTO {
  constructor({ id, displayName, firstName, division, organizationId, startedMissionIds, completedMissionIds } = {}) {
    this.id = id;
    this.displayName = displayName;
    this.firstName = firstName;
    this.division = division;
    this.organizationId = organizationId;
    this.startedMissionIds = startedMissionIds;
    this.completedMissionIds = completedMissionIds;
  }
}

export { OrganizationLearnerDTO };
