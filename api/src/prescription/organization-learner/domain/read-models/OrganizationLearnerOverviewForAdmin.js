class OrganizationLearnerOverviewForAdmin {
  constructor({
    id,
    firstName,
    lastName,
    birthdate,
    division,
    group,
    nationalStudentId,
    organizationId,
    organizationName,
    userId,
    updatedAt,
    isDisabled,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthdate = birthdate;
    this.division = division;
    this.group = group;
    this.nationalStudentId = nationalStudentId;
    this.organizationId = organizationId;
    this.organizationName = organizationName;
    this.userId = userId;
    this.updatedAt = updatedAt;
    this.isDisabled = isDisabled;
  }
}

export { OrganizationLearnerOverviewForAdmin };
