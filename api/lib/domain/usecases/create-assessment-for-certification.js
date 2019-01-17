const { ObjectValidationError } = require('../errors');

module.exports = async function createAssessmentForCertification({
  assessmentRepository,
  certificationCourseRepository,
  assessment,
} = {}) {
  const certificationCourse = await certificationCourseRepository.get(assessment.courseId);

  if (certificationCourse.userId !== assessment.userId) {
    throw new ObjectValidationError('Certification course must belong to user');
  }

  assessment.start();
  return assessmentRepository.save(assessment);
};
