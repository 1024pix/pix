const courseGroupRepository = require('../../infrastructure/repositories/course-group-repository');
const courseGroupSerializer = require('../../infrastructure/serializers/jsonapi/course-group-serializer');
const courseRepository = require('../../infrastructure/repositories/course-repository');

const extend = require('util')._extend;

const _ = require('lodash');

module.exports = {

  list(request, reply) {

    return courseGroupRepository.list()
      .then((courseGroups) => {
        return Promise.all([courseRepository.fetchCoursesFromArrayOfCourseGroup(courseGroups), courseGroups]);
      })
      .then(([courses, courseGroups]) => {
        const coursesMappedById = _mapCourseById(courses);
        const extendedlistOfCourseGroupWithCourse = _addCourseDetailsToCourseGroups(courseGroups, coursesMappedById);

        reply(courseGroupSerializer.serializeArray(extendedlistOfCourseGroupWithCourse));
      });

  }
};

function _addCourseDetailsToCourseGroups(listOfCourseGroupWithCourse, coursesMappedById) {
  listOfCourseGroupWithCourse.forEach((courseGroup) => {
    courseGroup.courses.forEach((course) => {
      extend(course, coursesMappedById[course.id]);
    });
  });

  return listOfCourseGroupWithCourse;
}

function _mapCourseById(courses) {
  const coursesMappedById = _.transform(courses, (result, value) => {
    result[value.id] = value;
  }, {});
  return coursesMappedById;
}
