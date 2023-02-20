import Tag from './Tag';

const types = {
  SCO: 'SCO',
  SUP: 'SUP',
  PRO: 'PRO',
};

const defaultValues = {
  credit: 0,
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
    identityProviderForCampaigns,
    credit = defaultValues.credit,
    email,
    targetProfileShares = [],
    organizationInvitations = [],
    tags = [],
    documentationUrl,
    createdBy,
    showNPS,
    formNPSUrl,
    showSkills,
    archivedAt,
  } = {}) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.logoUrl = logoUrl;
    this.externalId = externalId;
    this.provinceCode = provinceCode;
    this.identityProviderForCampaigns = identityProviderForCampaigns;
    this.isManagingStudents = isManagingStudents;
    this.credit = credit;
    this.email = email;
    this.targetProfileShares = targetProfileShares;
    this.organizationInvitations = organizationInvitations;
    this.tags = tags;
    this.documentationUrl = documentationUrl;
    this.createdBy = createdBy;
    this.showNPS = showNPS;
    this.formNPSUrl = formNPSUrl;
    this.showSkills = showSkills;
    this.archivedAt = archivedAt;
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

  get isPoleEmploi() {
    return Boolean(this.tags.find((tag) => tag.name === Tag.POLE_EMPLOI));
  }

  get isScoAndManagingStudents() {
    return this.isSco && this.isManagingStudents;
  }

  get isScoAndHasExternalId() {
    return this.isSco && Boolean(this.externalId);
  }

  get isArchived() {
    return this.archivedAt !== null;
  }
}

Organization.types = types;
Organization.defaultValues = defaultValues;
export default Organization;
