class Organization {

  constructor({
    id,
    // attributes
    name,
    type,
    logoUrl,
    externalId,
    provinceCode,
    isManagingStudents,
    credit,
    canCollectProfiles,
    email,
    // includes
    memberships = [],
    targetProfileShares = [],
    students = [],
    organizationInvitations = [],
    // references
  } = {}) {
    this.id = id;
    // attributes
    this.name = name;
    this.type = type;
    this.logoUrl = logoUrl;
    this.externalId = externalId;
    this.provinceCode = provinceCode;
    this.isManagingStudents = isManagingStudents;
    this.credit = credit;
    this.canCollectProfiles = canCollectProfiles;
    this.email = email;
    // includes
    this.memberships = memberships;
    this.targetProfileShares = targetProfileShares;
    this.students = students;
    this.organizationInvitations = organizationInvitations;
    // references
  }
}

module.exports = Organization;
