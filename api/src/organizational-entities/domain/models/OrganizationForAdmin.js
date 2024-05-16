import differenceBy from 'lodash/differenceBy.js';

import { ORGANIZATION_FEATURE } from '../../../shared/domain/constants.js';
import { DataProtectionOfficer } from './DataProtectionOfficer.js';

const CREDIT_DEFAULT_VALUE = 0;

class OrganizationForAdmin {
  constructor({
    id,
    name,
    type,
    logoUrl,
    externalId,
    provinceCode,
    isManagingStudents,
    credit = CREDIT_DEFAULT_VALUE,
    email,
    documentationUrl,
    createdBy,
    createdAt,
    showNPS,
    formNPSUrl,
    showSkills,
    archivedAt,
    archivistFirstName,
    archivistLastName,
    dataProtectionOfficerFirstName,
    dataProtectionOfficerLastName,
    dataProtectionOfficerEmail,
    creatorFirstName,
    creatorLastName,
    identityProviderForCampaigns,
    tags = [],
    tagIds = [],
    features = {},
    code,
    parentOrganizationId,
    parentOrganizationName,
  } = {}) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.logoUrl = logoUrl;
    this.externalId = externalId;
    this.provinceCode = provinceCode;
    this.isManagingStudents = isManagingStudents;
    this.credit = credit;
    this.email = email;
    this.documentationUrl = documentationUrl;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
    this.showNPS = showNPS;
    this.formNPSUrl = formNPSUrl;
    this.showSkills = showSkills;
    this.archivedAt = archivedAt;
    this.archivistFirstName = archivistFirstName;
    this.archivistLastName = archivistLastName;
    this.parentOrganizationId = parentOrganizationId;
    this.parentOrganizationName = parentOrganizationName;
    this.dataProtectionOfficer = new DataProtectionOfficer({
      organizationId: id,
      firstName: dataProtectionOfficerFirstName,
      lastName: dataProtectionOfficerLastName,
      email: dataProtectionOfficerEmail,
    });
    this.creatorFirstName = creatorFirstName;
    this.creatorLastName = creatorLastName;
    this.identityProviderForCampaigns = identityProviderForCampaigns;
    this.tags = tags;
    this.tagIds = tagIds;
    this.features = features;
    if (this.type === 'SCO' && this.isManagingStudents) {
      this.features[ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key] = true;
    }
    if (this.type === 'SCO-1D') {
      this.features[ORGANIZATION_FEATURE.MISSIONS_MANAGEMENT.key] = true;
      this.features[ORGANIZATION_FEATURE.LEARNER_IMPORT.key] = ORGANIZATION_FEATURE.LEARNER_IMPORT.FORMAT.ONDE;
    }
    this.tagsToAdd = [];
    this.tagsToRemove = [];
    this.code = code;
  }

  get archivistFullName() {
    return this.archivistFirstName && this.archivistLastName
      ? `${this.archivistFirstName} ${this.archivistLastName}`
      : null;
  }

  get creatorFullName() {
    return this.creatorFirstName && this.creatorLastName ? `${this.creatorFirstName} ${this.creatorLastName}` : null;
  }

  updateParentOrganizationId(parentOrganizationId) {
    this.parentOrganizationId = parentOrganizationId;
  }

  updateProvinceCode(provinceCode) {
    this.provinceCode = provinceCode;
  }

  updateIdentityProviderForCampaigns(identityProviderForCampaigns) {
    this.identityProviderForCampaigns = identityProviderForCampaigns;
  }

  updateWithDataProtectionOfficerAndTags(organization, dataProtectionOfficer = {}, tags = []) {
    const isAEFE = Boolean(tags.find((tag) => tag.name === 'AEFE'));

    if (organization.name) this.name = organization.name;
    if (organization.type) this.type = organization.type;
    if (organization.logoUrl) this.logoUrl = organization.logoUrl;
    this.email = organization.email;
    this.credit = organization.credit;
    this.externalId = organization.externalId;
    this.updateProvinceCode(organization.provinceCode);
    this.isManagingStudents = organization.isManagingStudents;
    this.documentationUrl = organization.documentationUrl;
    this.showSkills = organization.showSkills;
    this.updateIdentityProviderForCampaigns(organization.identityProviderForCampaigns);
    this.dataProtectionOfficer.updateInformation(dataProtectionOfficer);
    this.features = organization.features;
    this.features[ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key] =
      this.type === 'SCO' && (this.isManagingStudents || isAEFE);
    this.tagsToAdd = differenceBy(tags, this.tags, 'id').map(({ id }) => ({ tagId: id, organizationId: this.id }));
    this.tagsToRemove = differenceBy(this.tags, tags, 'id').map(({ id }) => ({ tagId: id, organizationId: this.id }));
  }
}

export { OrganizationForAdmin };
