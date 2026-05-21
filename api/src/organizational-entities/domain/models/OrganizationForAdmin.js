import Joi from 'joi';
import differenceBy from 'lodash/differenceBy.js';
import isEmpty from 'lodash/isEmpty.js';

import { ORGANIZATION_FEATURE } from '../../../shared/domain/constants.js';
import { FeatureParamsNotProcessable } from '../errors.js';
import { DataProtectionOfficer } from './DataProtectionOfficer.js';
import { Network } from './Network.js';

const PAD_TARGET_LENGTH = 3;
const PAD_STRING = '0';

const schema = Joi.object({
  features: Joi.object().pattern(
    Joi.string(),
    Joi.object({ active: Joi.boolean(), params: Joi.alternatives().try(Joi.object(), Joi.array()).empty(null) }),
  ),
}).unknown();

class OrganizationForAdmin {
  #provinceCode;
  shouldDeletePreviousLearners = false;

  constructor({
    id,
    name,
    type,
    logoUrl,
    externalId,
    provinceCode,
    isManagingStudents,
    credit = null,
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
    administrationTeamId,
    administrationTeamName,
    countryCode,
    countryName,
    organizationLearnerType,
    networkId,
    networkName,
    networkHeadOrganizationId,
    networkHeadOrganizationName,
  } = {}) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.logoUrl = logoUrl;
    this.externalId = externalId;
    this.provinceCode = provinceCode;
    this.credit = credit;
    this.email = this.#sanitizeEmptyStrings(email);
    this.documentationUrl = this.#sanitizeEmptyStrings(documentationUrl);
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
    this.administrationTeamId = administrationTeamId;
    this.administrationTeamName = administrationTeamName;
    this.organizationLearnerType = organizationLearnerType;

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
      if (this.features[ORGANIZATION_FEATURE.MISSIONS_MANAGEMENT.key] === undefined) {
        this.features[ORGANIZATION_FEATURE.MISSIONS_MANAGEMENT.key] = { active: true, params: null };
      }

      if (this.features[ORGANIZATION_FEATURE.ORALIZATION_MANAGED_BY_PRESCRIBER.key] === undefined) {
        this.features[ORGANIZATION_FEATURE.ORALIZATION_MANAGED_BY_PRESCRIBER.key] = { active: true, params: null };
      }

      if (this.features[ORGANIZATION_FEATURE.LEARNER_IMPORT.key] === undefined) {
        this.features[ORGANIZATION_FEATURE.LEARNER_IMPORT.key] = {
          active: true,
          params: { name: ORGANIZATION_FEATURE.LEARNER_IMPORT.FORMAT.ONDE },
        };
      }
    }

    this.tagsToAdd = [];
    this.tagsToRemove = [];
    this.code = code;
    this.countryCode = countryCode;
    this.countryName = countryName;
    if (networkId) {
      this.network = new Network({
        id: networkId,
        name: networkName,
        organizationId: networkHeadOrganizationId,
        organizationName: networkHeadOrganizationName,
      });
    } else {
      this.network = undefined;
    }

    this.#validate();
  }

  #validate() {
    if (
      this.features[ORGANIZATION_FEATURE.ATTESTATIONS_MANAGEMENT.key]?.active &&
      this.features[ORGANIZATION_FEATURE.ATTESTATIONS_MANAGEMENT.key].params === null
    ) {
      throw new FeatureParamsNotProcessable();
    }
    const { error } = schema.validate(this);

    if (error) {
      throw error;
    }
  }

  get provinceCode() {
    return this.#provinceCode;
  }

  set provinceCode(provinceCode) {
    this.#provinceCode = provinceCode ? provinceCode.padStart(PAD_TARGET_LENGTH, PAD_STRING) : null;
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
    if (organizationBatchUpdateDto.administrationTeamId)
      this.administrationTeamId = organizationBatchUpdateDto.administrationTeamId;
    if (organizationBatchUpdateDto.countryCode) this.countryCode = organizationBatchUpdateDto.countryCode;
    if (organizationBatchUpdateDto.organizationLearnerTypeId) {
      this.organizationLearnerType.id = organizationBatchUpdateDto.organizationLearnerTypeId;
      this.organizationLearnerType.name = undefined;
    }
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

  updateWithDataProtectionOfficerAndTags(newOrganization, dataProtectionOfficer = {}, tags = []) {
    const isAEFE = Boolean(tags.find((tag) => tag.name === 'AEFE'));

    if (newOrganization.name) this.name = newOrganization.name;
    if (newOrganization.type) this.type = newOrganization.type;
    if (newOrganization.logoUrl) this.logoUrl = newOrganization.logoUrl;
    this.email = isEmpty(newOrganization.email) ? null : newOrganization.email;
    this.credit = newOrganization.credit;
    this.externalId = newOrganization.externalId;
    this.provinceCode = newOrganization.provinceCode;
    this.documentationUrl = isEmpty(newOrganization.documentationUrl) ? null : newOrganization.documentationUrl;
    this.updateIsManagingStudents(newOrganization.features);
    this.showSkills = newOrganization.features[ORGANIZATION_FEATURE.SHOW_SKILLS.key].active;
    this.identityProviderForCampaigns = newOrganization.identityProviderForCampaigns;
    this.dataProtectionOfficer.updateInformation(dataProtectionOfficer);
    if (
      !this.features[ORGANIZATION_FEATURE.LEARNER_IMPORT.key]?.active &&
      newOrganization.features[ORGANIZATION_FEATURE.LEARNER_IMPORT.key]?.active
    ) {
      this.shouldDeletePreviousLearners = true;
    }
    this.features = newOrganization.features;
    this.features[ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key] = {
      active: this.type === 'SCO' && (this.isManagingStudents || isAEFE),
      params: null,
    };
    this.tagsToAdd = differenceBy(tags, this.tags, 'id').map(({ id }) => ({ tagId: id, organizationId: this.id }));
    this.tagsToRemove = differenceBy(this.tags, tags, 'id').map(({ id }) => ({ tagId: id, organizationId: this.id }));
    if (newOrganization.administrationTeamId) this.administrationTeamId = newOrganization.administrationTeamId;
    if (newOrganization.countryCode) this.countryCode = newOrganization.countryCode;
    if (newOrganization.organizationLearnerType.id) {
      this.organizationLearnerType = newOrganization.organizationLearnerType;
    }
  }

  setCountryName(countryName) {
    this.countryName = countryName;
  }

  #sanitizeEmptyStrings(value) {
    return value?.trim(' ') === '' ? null : value;
  }
}

export { OrganizationForAdmin };
