export const rejectCertificationCourse = async ({ certificationCourseId, assessmentResultRepository }) => {
  const assessmentResult = await assessmentResultRepository.getByCertificationCourseId({ certificationCourseId });

  const updatedAssessmentResult = assessmentResult.clone();
  updatedAssessmentResult.reject();
  await assessmentResultRepository.save({ certificationCourseId, assessmentResult: updatedAssessmentResult });
};
