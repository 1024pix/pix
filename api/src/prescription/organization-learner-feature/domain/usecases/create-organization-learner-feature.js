const createOrganizationLearnerFeature = async ({
  organizationLearnerId,
  featureKey,
  featureRepository,
  organizationLearnerFeatureRepository,
}) => {
  const feature = await featureRepository.getFeatureByKey(featureKey);

  return await organizationLearnerFeatureRepository.create({
    organizationLearnerId,
    featureId: feature.id,
  });
};
export { createOrganizationLearnerFeature };
