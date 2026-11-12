export async function getCombinedCourseByCode({
  userId,
  code,
  combinedCourseRepository,
  combinedCourseDetailsService,
  organizationLearnerPrescriptionRepository,
  attestationRepository,
  profileRewardRepository,
  combinedCourseBlueprintRepository,
  organizationRepository,
}) {
  const combinedCourse = await combinedCourseRepository.getByCode({ code });
  const combinedCourseDetails = await combinedCourseDetailsService.instantiateCombinedCourseDetails({
    combinedCourseId: combinedCourse.id,
  });

  let organizationLearnerId, profileReward;

  if (userId) {
    organizationLearnerId = await organizationLearnerPrescriptionRepository.findIdByUserIdAndOrganizationId({
      userId,
      organizationId: combinedCourse.organizationId,
    });
    profileReward = await profileRewardRepository.findByUserIdAndRewardId({
      rewardId: combinedCourse.quest.rewardId,
      userId,
    });
  }

  const attestation = await attestationRepository.getByRewardId({ rewardId: combinedCourse.quest.rewardId });

  const combinedCourseBlueprint = await combinedCourseBlueprintRepository.findById({ id: combinedCourse.blueprintId });

  const organizationDetails = await organizationRepository.get(combinedCourse.organizationId);
  combinedCourseDetails.setOrganizationDetails({
    name: organizationDetails.name,
    logoUrl: organizationDetails.logoUrl,
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
      requirementsDescription: combinedCourseBlueprint.rewardRequirementsDescription,
    },
  });
}
