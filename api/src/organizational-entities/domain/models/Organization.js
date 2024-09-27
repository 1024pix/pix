import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../identity-access-management/domain/constants/identity-providers.js';
import { Tag } from './Tag.js';

const types = {
  SCO: 'SCO',
  SUP: 'SUP',
  PRO: 'PRO',
  SCO1D: 'SCO-1D',
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
    schoolCode,
    sessionExpirationDate,
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
    this.schoolCode = schoolCode;
    this.sessionExpirationDate = sessionExpirationDate;
    this.archivedAt = archivedAt;
  }

  get isAgriculture() {
    return Boolean(this.tags.find((tag) => this.isSco && tag.name === Tag.AGRICULTURE));
  }

  get isArchived() {
    return this.archivedAt !== null;
  }

  get hasGarIdentityProvider() {
    return this.isScoAndManagingStudents && this.identityProviderForCampaigns === NON_OIDC_IDENTITY_PROVIDERS.GAR.code;
  }

  get isPro() {
    return this.type === types.PRO;
  }

  get isSco() {
    return this.type === types.SCO;
  }

  get isSup() {
    return this.type === types.SUP;
  }

  get isPoleEmploi() {
    return Boolean(this.tags.find((tag) => tag.name === Tag.POLE_EMPLOI));
  }

  get isScoAndHasExternalId() {
    return this.isSco && Boolean(this.externalId);
  }

  get isScoAndManagingStudents() {
    return this.isSco && this.isManagingStudents;
  }
}

Organization.types = types;
Organization.defaultValues = defaultValues;
export { Organization, types };
