import bluebird from 'bluebird';
import _ from 'lodash';
import { OrganizationTag } from '../../models/OrganizationTag.js';
import { DataProtectionOfficer } from '../../models/DataProtectionOfficer.js';
import * as apps from '../../constants.js';

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
  const dataProtectionOfficer = new DataProtectionOfficer({
    firstName: organization.dataProtectionOfficerFirstName ?? '',
    lastName: organization.dataProtectionOfficerLastName ?? '',
    email: organization.dataProtectionOfficerEmail ?? '',
    organizationId: organization.id,
  });

  const dataProtectionOfficerFound = await dataProtectionOfficerRepository.get({ organizationId: organization.id });

  if (dataProtectionOfficerFound) return dataProtectionOfficerRepository.update(dataProtectionOfficer);

  return dataProtectionOfficerRepository.create(dataProtectionOfficer);
}

async function _enablingOrganizationFeature(organization, organizationFeatureRepository) {
  const availableFeatures = await organizationFeatureRepository.getFeaturesListFromOrganization(organization.id);
  const isAssessmentFeatureEnable = availableFeatures.includes(
    apps.ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key,
  );

  const organizationFeatureData = {
    organizationId: organization.id,
    featureKey: apps.ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key,
  };

  if (isAssessmentFeatureEnable && !organization.enableMultipleSendingAssessment) {
    await organizationFeatureRepository.removeFeatureToOrganization(organizationFeatureData);
  } else if (!isAssessmentFeatureEnable && organization.enableMultipleSendingAssessment) {
    await organizationFeatureRepository.addFeatureToOrganization(organizationFeatureData);
  }
}

const updateOrganizationInformation = async function ({
  organization,
  dataProtectionOfficerRepository,
  organizationFeatureRepository,
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

  await _enablingOrganizationFeature(organization, organizationFeatureRepository);

  updatedOrganization.enableMultipleSendingAssessment = organization.enableMultipleSendingAssessment;
  updatedOrganization.dataProtectionOfficerFirstName = dataProtectionOfficer.firstName;
  updatedOrganization.dataProtectionOfficerLastName = dataProtectionOfficer.lastName;
  updatedOrganization.dataProtectionOfficerEmail = dataProtectionOfficer.email;

  return updatedOrganization;
};

export { updateOrganizationInformation };
