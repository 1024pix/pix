export async function getCombinedCourseByCode({
  userId,
  code,
  combinedCourseRepository,
  combinedCourseDetailsService,
  organizationLearnerPrescriptionRepository,
  attestationRepository,
  profileRewardRepository,
  combinedCourseBlueprintRepository,
  combinedCourseParticipationRepository,
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

  const parentCombinedCourse = await combinedCourseRepository.findParentByChildId({
    childCombinedCourseId: combinedCourse.id,
    organizationId: combinedCourse.organizationId,
  });

  if (parentCombinedCourse && organizationLearnerId) {
    const parentParticipations = await combinedCourseParticipationRepository.findByLearnerIdAndCombinedCourseIds({
      organizationLearnerId,
      combinedCourseIds: [parentCombinedCourse.id],
    });
    if (parentParticipations.length > 0) {
      combinedCourseDetails.setParent(parentCombinedCourse);
    }
  }

  const attestation = await attestationRepository.getByRewardId({ rewardId: combinedCourse.quest.rewardId });
  const profileReward = await profileRewardRepository.findByUserIdAndRewardId({
    rewardId: combinedCourse.quest.rewardId,
    userId,
  });
  const combinedCourseBlueprint = await combinedCourseBlueprintRepository.findById({ id: combinedCourse.blueprintId });

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
