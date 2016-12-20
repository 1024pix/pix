import _ from 'lodash/lodash';
import refCourse from '../data/courses/ref-course';
import rawCourse from '../data/courses/raw-course';

export default function (schema, request) {

  const allCourses = [
    refCourse.data,
    rawCourse.data
  ];

  const filteredCourses = _.filter(allCourses, function (oneCourse) {
    return _.isEmpty(request.queryParams.isAdaptive) || oneCourse.attributes.isAdaptive;
  });

  return { data: filteredCourses };
}
