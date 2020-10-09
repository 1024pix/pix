const types = {
  SCO : 'SCO',
  SUP: 'SUP',
  PRO: 'PRO',
};

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

  get isSup() {
    return this.type === types.SUP;
  }

  get isSco() {
    return this.type === types.SCO;
  }

  get isPro() {
    return this.type === types.PRO;
  }

  get isAgriculture() {
    return this.isSco && process.env['AGRICULTURE_ORGANIZATION_ID'] === this.id.toString();
  }

  get isPoleEmploi() {
    return process.env['POLE_EMPLOI_ORGANIZATION_ID'] === this.id.toString();
  }
}

Organization.types = types;
module.exports = Organization;
