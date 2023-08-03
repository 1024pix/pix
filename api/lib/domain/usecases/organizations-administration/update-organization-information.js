import bluebird from 'bluebird';
import _ from 'lodash';
import { OrganizationTag } from '../../models/OrganizationTag.js';

async function _updateOrganizationTags({
  organization,
  existingOrganization,
  organizationTagRepository,
  tagRepository,
}) {
  const tags = organization.tags;
  const existingTags = existingOrganization.tags;

  const tagsToAdd = _.differenceBy(tags, existingTags, 'id');
  const tagsToRemove = _.differenceBy(existingTags, tags, 'id');

  if (tagsToAdd.length > 0) {
    await bluebird.mapSeries(tagsToAdd, async (tag) => {
      await tagRepository.get(tag.id);

      const organizationTag = new OrganizationTag({ organizationId: existingOrganization.id, tagId: tag.id });
      await organizationTagRepository.create(organizationTag);
    });
  }

  if (tagsToRemove.length > 0) {
    await bluebird.mapSeries(tagsToRemove, async (tag) => {
      const organizationTag = await organizationTagRepository.findOneByOrganizationIdAndTagId({
        organizationId: organization.id,
        tagId: tag.id,
      });
      await organizationTagRepository.remove({ organizationTagId: organizationTag.id });
    });
  }
}

async function _addOrUpdateDataProtectionOfficer({ organization, dataProtectionOfficerRepository }) {
  const dataProtectionOfficerFound = await dataProtectionOfficerRepository.get({ organizationId: organization.id });

  if (dataProtectionOfficerFound) return dataProtectionOfficerRepository.update(organization.dataProtectionOfficer);

  return dataProtectionOfficerRepository.create(organization.dataProtectionOfficer);
}

const updateOrganizationInformation = async function ({
  organization,
  dataProtectionOfficerRepository,
  organizationForAdminRepository,
  organizationTagRepository,
  tagRepository,
}) {
  const existingOrganization = await organizationForAdminRepository.get(organization.id);
  await _updateOrganizationTags({
    organization,
    existingOrganization,
    organizationTagRepository,
    tagRepository,
  });

  existingOrganization.updateInformation(organization);

  const updatedOrganization = await organizationForAdminRepository.update(existingOrganization);
  const dataProtectionOfficer = await _addOrUpdateDataProtectionOfficer({
    dataProtectionOfficerRepository,
    organization,
  });

  updatedOrganization.enableMultipleSendingAssessment = organization.enableMultipleSendingAssessment;
  updatedOrganization.dataProtectionOfficer.firstName = dataProtectionOfficer.firstName;
  updatedOrganization.dataProtectionOfficer.lastName = dataProtectionOfficer.lastName;
  updatedOrganization.dataProtectionOfficer.email = dataProtectionOfficer.email;

  return updatedOrganization;
};

export { updateOrganizationInformation };
