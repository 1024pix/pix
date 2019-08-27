export default function(schema) {
  const certificationCourse = schema.courses.create({ id: 'certification-course-id' });
  const newAssessment = {
    type: 'CERTIFICATION',
    courseId: certificationCourse.id,
    certificationNumber: certificationCourse.id,
  };
  schema.assessments.create(newAssessment);
  return certificationCourse;
}
