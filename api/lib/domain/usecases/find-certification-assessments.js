module.exports = function findCertificationAssessments({ userId, filters, assessmentRepository }) {

  if (filters.courseId) {
    return assessmentRepository.getCertificationAssessmentByUserIdAndCourseId(userId, filters.courseId)
      .then((assessment) => {
        if(!assessment) {
          return [];
        }
        return [assessment];
      });
  }
  return Promise.resolve([]);
};
