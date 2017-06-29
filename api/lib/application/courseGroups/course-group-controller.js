const courseGroupRepository = require('../../infrastructure/repositories/course-group-repository');
const courseGroupSerializer = require('../../infrastructure/serializers/jsonapi/course-group-serializer');
const courseRepository = require('../../infrastructure/repositories/course-repository');

const extend = require('util')._extend;

const _ = require('lodash');

module.exports = {

  list(request, reply) {

    let listOfCourseGroup;

    return courseGroupRepository.list()
      .then((courseGroups) => {
        listOfCourseGroup = courseGroups;
        return courseRepository.fetchCoursesFromArrayOfCourseGroup(listOfCourseGroup);
      })
      .then((courses) => {
        const coursesMappedById = _mapCourseById(courses);
        const extendedlistOfCourseGroupWithCourse = _addCourseDetailsToCourseGroups(listOfCourseGroup, coursesMappedById);

        reply(courseGroupSerializer.serializeArray(extendedlistOfCourseGroupWithCourse));
      });

  }
};

function _addCourseDetailsToCourseGroups(extendedlistOfCourseGroupWithCourse, coursesMappedById) {
  extendedlistOfCourseGroupWithCourse.forEach((courseGroup) => {
    courseGroup.courses.forEach((course) => {
      extend(course, coursesMappedById[course.id]);
    });
  });

  return extendedlistOfCourseGroupWithCourse;
}

function _mapCourseById(courses) {
  const coursesMappedById = _.transform(courses, (result, value) => {
    result[value.id] = value;
  }, {});
  return coursesMappedById;
}
