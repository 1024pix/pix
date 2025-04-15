import Joi from 'joi';
import differenceBy from 'lodash/differenceBy.js';

import { ORGANIZATION_FEATURE } from '../../../shared/domain/constants.js';
import { DataProtectionOfficer } from './DataProtectionOfficer.js';

const CREDIT_DEFAULT_VALUE = 0;
const PAD_TARGET_LENGTH = 3;
const PAD_STRING = '0';

const schema = Joi.object({
  features: Joi.object().pattern(Joi.string(), Joi.object({ active: Joi.boolean(), params: Joi.object().empty(null) })),
}).unknown();

class OrganizationForAdmin {
  #provinceCode;

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
    this.credit = credit;
    this.email = email;
    this.documentationUrl = documentationUrl;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
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

    // @deprecated you should use value stored in features property
    this.isManagingStudents = isManagingStudents;
    // @deprecated you should use value stored in features property
    this.showNPS = showNPS;
    // @deprecated you should use value stored in features property
    this.formNPSUrl = formNPSUrl;
    // @deprecated you should use value stored in features property
    this.showSkills = showSkills;

    this.features = features;

    this.features[ORGANIZATION_FEATURE.IS_MANAGING_STUDENTS.key] = {
      active: isManagingStudents,
      params: null,
    };
    this.features[ORGANIZATION_FEATURE.SHOW_SKILLS.key] = {
      active: showSkills,
      params: null,
    };
    this.features[ORGANIZATION_FEATURE.SHOW_NPS.key] = {
      active: showNPS,
      params: showNPS ? { formNPSUrl: formNPSUrl } : null,
    };
    if (this.features[ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key] === undefined) {
      this.features[ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key] = {
        active: true,
        params: null,
      };
    }
    if (this.type === 'SCO' && this.isManagingStudents) {
      this.features[ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key] = {
        active: true,
        params: null,
      };
    }
    if (this.type === 'SCO-1D') {
      this.features[ORGANIZATION_FEATURE.MISSIONS_MANAGEMENT.key] = { active: true, params: null };
      this.features[ORGANIZATION_FEATURE.ORALIZATION_MANAGED_BY_PRESCRIBER.key] = { active: true, params: null };
      this.features[ORGANIZATION_FEATURE.LEARNER_IMPORT.key] = {
        active: true,
        params: { name: ORGANIZATION_FEATURE.LEARNER_IMPORT.FORMAT.ONDE },
      };
    }
    this.tagsToAdd = [];
    this.tagsToRemove = [];
    this.code = code;

    this.#validate();
  }

  #validate() {
    const { error } = schema.validate(this);

    if (error) {
      throw error;
    }
  }

  get provinceCode() {
    return this.#provinceCode;
  }

  set provinceCode(provinceCode) {
    this.#provinceCode = provinceCode ? provinceCode.padStart(PAD_TARGET_LENGTH, PAD_STRING) : '';
  }

  get archivistFullName() {
    return this.archivistFirstName && this.archivistLastName
      ? `${this.archivistFirstName} ${this.archivistLastName}`
      : null;
  }

  get creatorFullName() {
    return this.creatorFirstName && this.creatorLastName ? `${this.creatorFirstName} ${this.creatorLastName}` : null;
  }

  /**
   * @param {OrganizationBatchUpdateDTO} organizationBatchUpdateDto
   */
  updateFromOrganizationBatchUpdateDto(organizationBatchUpdateDto) {
    if (organizationBatchUpdateDto.name) this.name = organizationBatchUpdateDto.name;
    if (organizationBatchUpdateDto.externalId) this.externalId = organizationBatchUpdateDto.externalId;
    if (organizationBatchUpdateDto.documentationUrl)
      this.documentationUrl = organizationBatchUpdateDto.documentationUrl;
    if (organizationBatchUpdateDto.provinceCode) this.provinceCode = organizationBatchUpdateDto.provinceCode;
    if (organizationBatchUpdateDto.identityProviderForCampaigns)
      this.identityProviderForCampaigns = organizationBatchUpdateDto.identityProviderForCampaigns;
    if (organizationBatchUpdateDto.parentOrganizationId)
      this.parentOrganizationId = organizationBatchUpdateDto.parentOrganizationId;

    const dataProtectionOfficer = {
      firstName: this.dataProtectionOfficer.firstName,
      lastName: this.dataProtectionOfficer.lastName,
      email: this.dataProtectionOfficer.email,
    };
    if (organizationBatchUpdateDto.dataProtectionOfficerFirstName)
      dataProtectionOfficer.firstName = organizationBatchUpdateDto.dataProtectionOfficerFirstName;
    if (organizationBatchUpdateDto.dataProtectionOfficerLastName)
      dataProtectionOfficer.lastName = organizationBatchUpdateDto.dataProtectionOfficerLastName;
    if (organizationBatchUpdateDto.dataProtectionOfficerEmail)
      dataProtectionOfficer.email = organizationBatchUpdateDto.dataProtectionOfficerEmail;
    this.dataProtectionOfficer.updateInformation(dataProtectionOfficer);
  }

  updateParentOrganizationId(parentOrganizationId) {
    this.parentOrganizationId = parentOrganizationId;
  }

  updateIsManagingStudents(features) {
    const hasLearnerImportFeature =
      features[ORGANIZATION_FEATURE.LEARNER_IMPORT.key] && features[ORGANIZATION_FEATURE.LEARNER_IMPORT.key].active;

    this.isManagingStudents = hasLearnerImportFeature
      ? false
      : features[ORGANIZATION_FEATURE.IS_MANAGING_STUDENTS.key].active;
  }

  updateWithDataProtectionOfficerAndTags(organization, dataProtectionOfficer = {}, tags = []) {
    const isAEFE = Boolean(tags.find((tag) => tag.name === 'AEFE'));

    if (organization.name) this.name = organization.name;
    if (organization.type) this.type = organization.type;
    if (organization.logoUrl) this.logoUrl = organization.logoUrl;
    this.email = organization.email;
    this.credit = organization.credit;
    this.externalId = organization.externalId;
    this.provinceCode = organization.provinceCode;
    this.documentationUrl = organization.documentationUrl;
    this.updateIsManagingStudents(organization.features);
    this.showSkills = organization.features[ORGANIZATION_FEATURE.SHOW_SKILLS.key].active;
    this.identityProviderForCampaigns = organization.identityProviderForCampaigns;
    this.dataProtectionOfficer.updateInformation(dataProtectionOfficer);
    this.features = organization.features;
    this.features[ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key] = {
      active: this.type === 'SCO' && (this.isManagingStudents || isAEFE),
      params: null,
    };
    this.tagsToAdd = differenceBy(tags, this.tags, 'id').map(({ id }) => ({ tagId: id, organizationId: this.id }));
    this.tagsToRemove = differenceBy(this.tags, tags, 'id').map(({ id }) => ({ tagId: id, organizationId: this.id }));
  }
}

export { OrganizationForAdmin };
