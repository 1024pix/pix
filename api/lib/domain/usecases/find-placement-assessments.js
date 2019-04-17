module.exports = function findPlacementAssessments({ userId, filters, assessmentRepository }) {

  if (filters.courseId && filters.resumable === 'true') {
    return assessmentRepository.findOneLastPlacementAssessmentByUserIdAndCourseId(userId, filters.courseId)
      .then((assessment) => assessment && assessment.state === 'started' ? assessment : null)
      .then((assessment) => {
        if (!assessment) {
          return [];
        }
        return [assessment];
      });
  }
  return Promise.resolve([]);
};
