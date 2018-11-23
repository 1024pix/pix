module.exports = function findPlacementAssessments({ userId, filters, assessmentRepository }) {

  if (filters.courseId && filters.state === 'started') {
    return assessmentRepository.getStartedPlacementAssessmentByUserIdAndCourseId(userId, filters.courseId)
      .then((assessment) => {
        if(!assessment) {
          return [];
        }
        return [assessment];
      });
  }
  return Promise.resolve([]);
};
