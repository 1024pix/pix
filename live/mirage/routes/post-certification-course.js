export default function(schema) {

  const certificationCourse = schema.courses.find('42');
  // XXX certification-courses is a subclass of courses, and need
  // to be manually set in mirage
  certificationCourse.modelName = 'certification-courses';

  return certificationCourse;
}
