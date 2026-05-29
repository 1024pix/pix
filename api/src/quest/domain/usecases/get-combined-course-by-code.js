export async function getCombinedCourseByCode({
  userId,
  code,
  combinedCourseRepository,
  combinedCourseDetailsService,
  organizationLearnerPrescriptionRepository,
  attestationRepository,
  profileRewardRepository,
}) {
  const combinedCourse = await combinedCourseRepository.getByCode({ code });
  const combinedCourseDetails = await combinedCourseDetailsService.instantiateCombinedCourseDetails({
    combinedCourseId: combinedCourse.id,
  });

  if (!userId) {
    return combinedCourseDetails;
  }

  const organizationLearnerId = await organizationLearnerPrescriptionRepository.findIdByUserIdAndOrganizationId({
    userId,
    organizationId: combinedCourse.organizationId,
  });

  const attestation = await attestationRepository.getByRewardId({ rewardId: combinedCourse.quest.rewardId });
  const profileReward = await profileRewardRepository.findByUserIdAndRewardId({
    rewardId: combinedCourse.quest.rewardId,
    userId,
  });

  return combinedCourseDetailsService.getCombinedCourseDetails({
    organizationLearnerId,
    combinedCourseDetails,
    reward: {
      id: attestation.id,
      key: attestation.key,
      obtainedAt: profileReward?.createdAt,
      label: attestation?.label,
      templateName: attestation.templateName,
    },
  });
}
