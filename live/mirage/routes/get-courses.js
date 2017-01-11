import _ from 'pix-live/utils/lodash-custom';

import refCourse      from '../data/courses/ref-course';
import rawCourse      from '../data/courses/raw-course';
import adaptiveCourse from '../data/courses/adaptive-course';

export default function (schema, request) {

  const allCourses = [
    refCourse.data,
    rawCourse.data,
    adaptiveCourse.data
  ];

  const filteredCourses = _.filter(allCourses, function (oneCourse) {
    return _.isEmpty(request.queryParams.isAdaptive) || oneCourse.attributes['is-adaptive'];
  });

  return { data: filteredCourses };
}
