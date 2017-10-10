import _ from 'pix-live/utils/lodash-custom';

import refCourse from '../data/courses/ref-course';
import highlightedCourse from '../data/courses/highlighted-course';
import courseWithTimedChallenge from '../data/courses/ref-course-timed-challenges';

export default function(schema, request) {

  const id = request.params.id;

  const allCourses = [
    refCourse,
    highlightedCourse,
    courseWithTimedChallenge
  ];

  if (allCourses.map((course) => course.data.id).includes(id)) {

    const courses = _.map(allCourses, (oneCourse) => {
      return { id: oneCourse.data.id, obj: oneCourse };
    });

    const course = _.find(courses, { id: request.params.id });

    if (course) {
      return course.obj;
    } else {
      throw new Error(`The course you required in the fake server does not exist ${request.params.id}`);
    }
  }
  return schema.courses.find(id);
}
