class OrganizationLearner {
  constructor({
    id,
    lastName,
    firstName,
    division,
    features,
    organizationId,
    completedMissionIds,
    startedMissionIds,
  } = {}) {
    this.id = id;
    this.lastName = lastName;
    this.firstName = firstName;
    this.division = division;
    this.features = features || [];
    this.organizationId = organizationId;
    this.completedMissionIds = completedMissionIds;
    this.startedMissionIds = startedMissionIds;
  }
}

export { OrganizationLearner };
