const unlinkOrganizationLearnerFeature = async ({
  organizationLearnerId,
  featureKey,
  featureRepository,
  organizationLearnerFeatureRepository,
}) => {
  const feature = await featureRepository.getFeatureByKey(featureKey);

  return await organizationLearnerFeatureRepository.unlink({
    organizationLearnerId,
    featureId: feature.id,
  });
};
export { unlinkOrganizationLearnerFeature };
