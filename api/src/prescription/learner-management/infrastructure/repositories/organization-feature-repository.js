import * as injectedOrganizationFeatureApi from '../../../../organizational-entities/application/api/organization-features-api.js';async function hasLearnersImportFeature(
  { organizationId, organizationFeatureApi = injectedOrganizationFeatureApi } = {},
) {
  const { hasLearnersImportFeature } = await organizationFeatureApi.getAllFeaturesFromOrganization(organizationId);

  return hasLearnersImportFeature;
}

export { hasLearnersImportFeature };
