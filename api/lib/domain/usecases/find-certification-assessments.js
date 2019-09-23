module.exports = function findCertificationAssessments({ userId, filters, assessmentRepository }) {

  if (filters.courseId && filters.resumable === 'true') {
    return assessmentRepository.findOneCertificationAssessmentByUserIdAndCourseId(userId, filters.courseId)
      .then((assessment) => {
        if (!assessment) {
          return [];
        }
        return [assessment];
      });
  }
  return Promise.resolve([]);
};
