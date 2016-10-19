import simpleCourse from '../data/courses/simple-course';
import noImageCourse from '../data/courses/no-image-course';

export default function (schema, request) {

  const courseId = request.params.id;

  if (courseId === 'course_with_no_image') {
    return noImageCourse;
  }
  return simpleCourse;

}
