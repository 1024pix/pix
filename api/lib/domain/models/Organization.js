class Organization {

  constructor({
    id,
    // attributes
    code,
    name,
    type,
    logoUrl,
    externalId,
    provinceCode,
    isManagingStudents,
    // includes
    user,
    memberships = [],
    targetProfileShares = [],
    students = [],
    organizationInvitations = [],
    // references
  } = {}) {
    this.id = id;
    // attributes
    this.code = code;
    this.name = name;
    this.type = type;
    this.logoUrl = logoUrl;
    this.externalId = externalId;
    this.provinceCode = provinceCode;
    this.isManagingStudents = isManagingStudents;
    // includes
    this.user = user;
    this.memberships = memberships;
    this.targetProfileShares = targetProfileShares;
    this.students = students;
    this.organizationInvitations = organizationInvitations;
    // references
  }
}

module.exports = Organization;
