module.exports = async ({ authenticatedUserId, userRepository, assessmentRepository }) => {
  const user = await userRepository.get(authenticatedUserId);
  const usesProfileV2 = await assessmentRepository.hasCampaignOrCompetenceEvaluation(authenticatedUserId);

  user.usesProfileV2 = usesProfileV2;

  return user;
};
