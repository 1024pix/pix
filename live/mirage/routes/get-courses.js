import refCourse from '../data/courses/ref-course';
import courseOfTheWeek from '../data/courses/highlighted-course';

export default function (schema, request) {
  const courses = [refCourse.data];

  if (request.queryParams && request.queryParams.isCourseOfTheWeek) {
    courses.push(courseOfTheWeek.data);
  }

  return { data: courses };
}
