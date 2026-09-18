import differenceBy from 'lodash/differenceBy.js';
import isEmpty from 'lodash/isEmpty.js';

import { ORGANIZATION_FEATURE } from '../../../shared/constants.js';
import { padProvinceCode } from '../services/province-code.service.js';
import { DataProtectionOfficer } from './DataProtectionOfficer.js';
import { OrganizationLearnerType } from './OrganizationLearnerType.js';

class OrganizationForUpdate {
  #provinceCode;

  constructor(existingOrganization) {
    this.id = existingOrganization.id;
    this.name = existingOrganization.name;
    this.type = existingOrganization.type;
    this.logoUrl = existingOrganization.logoUrl;
    this.externalId = existingOrganization.externalId;
    this.provinceCode = existingOrganization.provinceCode;
    this.isManagingStudents = existingOrganization.isManagingStudents;
    this.credit = existingOrganization.credit;
    this.email = existingOrganization.email;
    this.documentationUrl = existingOrganization.documentationUrl;
    this.identityProviderForCampaigns = existingOrganization.identityProviderForCampaigns;
    this.showSkills = existingOrganization.showSkills;
    this.features = existingOrganization.features;
    this.parentOrganizationId = existingOrganization.parentOrganizationId;
    this.administrationTeamId = existingOrganization.administrationTeamId;
    this.countryCode = existingOrganization.countryCode;
    this.categoryId = existingOrganization.categoryId;
    this.tags = existingOrganization.tags;
    this.organizationLearnerType = new OrganizationLearnerType({
      id: existingOrganization.organizationLearnerType?.id,
      name: existingOrganization.organizationLearnerType?.name,
    });
    this.dataProtectionOfficer = new DataProtectionOfficer({
      organizationId: existingOrganization.id,
      firstName: existingOrganization.dataProtectionOfficer.firstName,
      lastName: existingOrganization.dataProtectionOfficer.lastName,
      email: existingOrganization.dataProtectionOfficer.email,
    });
    this.tagsToAdd = [];
    this.tagsToRemove = [];
    this.shouldDeletePreviousLearners = false;
  }

  /**
   * @param {OrganizationBatchUpdateDTO} organizationBatchUpdateDto
   */
  applyBatchUpdate(organizationBatchUpdateDto) {
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
    if (organizationBatchUpdateDto.categoryId) this.categoryId = organizationBatchUpdateDto.categoryId;
  }

  applyInformationUpdate(newOrganization, dataProtectionOfficer = {}, tags = []) {
    const isAEFE = Boolean(tags.find((tag) => tag.name === 'AEFE'));

    if (newOrganization.name) this.name = newOrganization.name;
    if (newOrganization.type) this.type = newOrganization.type;
    if (newOrganization.logoUrl) this.logoUrl = newOrganization.logoUrl;
    this.email = isEmpty(newOrganization.email) ? null : newOrganization.email;
    this.credit = newOrganization.credit;
    this.externalId = newOrganization.externalId;
    this.provinceCode = newOrganization.provinceCode;
    this.documentationUrl = isEmpty(newOrganization.documentationUrl) ? null : newOrganization.documentationUrl;
    this.#updateIsManagingStudents(newOrganization.features);
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
    if (newOrganization.categoryId) this.categoryId = newOrganization.categoryId;
  }

  detachParent() {
    this.parentOrganizationId = null;
  }

  get provinceCode() {
    return this.#provinceCode;
  }

  set provinceCode(provinceCode) {
    this.#provinceCode = padProvinceCode(provinceCode);
  }

  #updateIsManagingStudents(features) {
    const hasLearnerImportFeature =
      features[ORGANIZATION_FEATURE.LEARNER_IMPORT.key] && features[ORGANIZATION_FEATURE.LEARNER_IMPORT.key].active;

    this.isManagingStudents = hasLearnerImportFeature
      ? false
      : features[ORGANIZATION_FEATURE.IS_MANAGING_STUDENTS.key].active;
  }
}

export { OrganizationForUpdate };
