const Tag = require('./Tag');

const types = {
  SCO: 'SCO',
  SUP: 'SUP',
  PRO: 'PRO',
};

const defaultValues = {
  credit: 0,
  canCollectProfiles: false,
};

class Organization {

  constructor({
    id,
    name,
    type,
    logoUrl,
    externalId,
    provinceCode,
    isManagingStudents,
    credit = defaultValues.credit,
    canCollectProfiles = defaultValues.canCollectProfiles,
    email,
    targetProfileShares = [],
    students = [],
    organizationInvitations = [],
    tags = [],
  } = {}) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.logoUrl = logoUrl;
    this.externalId = externalId;
    this.provinceCode = provinceCode;
    this.isManagingStudents = isManagingStudents;
    this.credit = credit;
    this.canCollectProfiles = canCollectProfiles;
    this.email = email;
    this.targetProfileShares = targetProfileShares;
    this.students = students;
    this.organizationInvitations = organizationInvitations;
    this.tags = tags;
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
    return Boolean(this.tags.find((tag) => this.isSco && tag.name === Tag.AGRICULTURE));
  }

  get isCFA() {
    return Boolean(this.tags.find((tag) => this.isSco && tag.name === Tag.CFA));
  }

  get isAEFE() {
    return Boolean(this.tags.find((tag) => this.isSco && tag.name === Tag.AEFE));
  }

  get isMLF() {
    return Boolean(this.tags.find((tag) => this.isSco && tag.name === Tag.MLF));
  }

  get isPoleEmploi() {
    return Boolean(this.tags.find((tag) => tag.name === Tag.POLE_EMPLOI));
  }

  get isMediationNumerique() {
    return Boolean(this.tags.find((tag) => this.isPro && tag.name === Tag.MEDIATION_NUMERIQUE));
  }

  get isScoAndManagingStudents() {
    return this.isSco && this.isManagingStudents;
  }
}

Organization.types = types;
Organization.defaultValues = defaultValues;
module.exports = Organization;
