export const unrejectCertificationCourse = async ({
  certificationCourseId,
  juryId,
  certificationCourseRepository,
  assessmentResultRepository,
}) => {
  const certificationCourse = await certificationCourseRepository.get({ id: certificationCourseId });
  certificationCourse.unrejectForFraud();
  await certificationCourseRepository.update({ certificationCourse });

  const assessmentResult = await assessmentResultRepository.getByCertificationCourseId({ certificationCourseId });
  const newAssessmentResult = assessmentResult.clone();
  newAssessmentResult.unreject({ juryId });

  await assessmentResultRepository.save({
    certificationCourseId,
    assessmentResult: newAssessmentResult,
  });
};
