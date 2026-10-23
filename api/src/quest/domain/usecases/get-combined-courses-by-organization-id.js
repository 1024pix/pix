export default async ({
  organizationId,
  page,
  combinedCourseRepository,
  organizationLearnerParticipationRepository,
}) => {
  const { combinedCourses, meta } = await combinedCourseRepository.findByOrganizationId({
    organizationId,
    page: page?.number,
    size: page?.size,
  });

  if (combinedCourses.length === 0) {
    return { combinedCourses: [], meta };
  }

  const combinedCourseIds = combinedCourses.map((combinedCourse) => combinedCourse.id);

  const allCombinedCourseParticipations = await organizationLearnerParticipationRepository.findByCombinedCourseIds({
    combinedCourseIds,
  });

  const combinedCoursesWithParticipations = combinedCourses.map((combinedCourse) => {
    combinedCourse.participations = allCombinedCourseParticipations.filter(
      (participation) => participation.referenceId === combinedCourse.id.toString(),
    );
    return combinedCourse;
  });

  return { combinedCourses: combinedCoursesWithParticipations, meta };
};
