export const getAllFeaturesFromOrganization = async ({ organizationId, organizationFeaturesApi }) => {
  return await organizationFeaturesApi.getAllFeaturesFromOrganization(organizationId);
};
