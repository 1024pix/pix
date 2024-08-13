async function hasLearnersImportFeature({ organizationId, organizationFeatureApi }) {
  const { hasLearnersImportFeature } = await organizationFeatureApi.getAllFeaturesFromOrganization(organizationId);

  return hasLearnersImportFeature;
}

export { hasLearnersImportFeature };
