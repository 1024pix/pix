export const findCombinedCourseParticipations = async ({
  combinedCourseId,
  page,
  filters,
  combinedCourseParticipationRepository,
  combinedCourseDetailsService,
}) => {
  const { organizationLearners, meta } =
    await combinedCourseParticipationRepository.findPaginatedCombinedCourseParticipationById({
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
