class Organization {

  constructor({
    id,
    // attributes
    code,
    name,
    type,
    logoUrl,
    externalId,
    isManagingStudents,
    // includes
    user,
    memberships = [],
    targetProfileShares = [],
    students = [],
    // references
  } = {}) {
    this.id = id;
    // attributes
    this.code = code;
    this.name = name;
    this.type = type;
    this.logoUrl = logoUrl;
    this.externalId = externalId;
    this.isManagingStudents = isManagingStudents;
    // includes
    this.user = user;
    this.memberships = memberships;
    this.targetProfileShares = targetProfileShares;
    this.students = students;
    // references
  }
}

module.exports = Organization;
