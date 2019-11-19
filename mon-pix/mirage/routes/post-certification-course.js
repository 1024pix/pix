export default function(schema) {
  const newAssessment = {
    type: 'CERTIFICATION',
    certificationNumber: 'certification-course-id',
  };
  const assessment = schema.assessments.create(newAssessment);
  return schema.certificationCourses.create({ id: 'certification-course-id', nbChallenges: 10, assessment });
}
