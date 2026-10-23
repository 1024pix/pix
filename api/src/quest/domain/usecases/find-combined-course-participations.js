export const findCombinedCourseParticipations = async ({
  combinedCourseId,
  page,
  filters,
  organizationLearnerParticipationRepository,
  combinedCourseDetailsService,
}) => {
  const { organizationLearners, meta } =
    await organizationLearnerParticipationRepository.findPaginatedCombinedCourseParticipationById({
      combinedCourseId,
      page,
      filters,
    });

  const combinedCourseDetails = await combinedCourseDetailsService.instantiateCombinedCourseDetails({
    combinedCourseId,
  });

  const resultsByLearnerId = await combinedCourseDetailsService.getCombinedCourseDetailsForMultipleLearners({
    organizationLearners,
    combinedCourseDetails,
  });

  return {
    combinedCourseParticipations: resultsByLearnerId
      .values()
      .toArray()
      .map(({ participationDetails }) => participationDetails),
    meta,
  };
};
