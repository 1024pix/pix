//const courseGroup = require('../../domain/models/referential/course-group');
const courseGroupRepository = require('../../infrastructure/repositories/course-group-repository');
const courseGroupSerializer = require('../../infrastructure/serializers/jsonapi/course-group-serializer');
const courseRepository = require('../../infrastructure/repositories/course-repository');

const extend = require('util')._extend;

const _ = require('lodash');

module.exports = {

  list(request, reply) {
    return courseGroupRepository.list()
      .then((listOfCourseGroup) => {

        listOfCourseGroup.forEach((courseGroup, indexCourseGroup) => {
          courseGroup.courses.forEach((course, indexCourse) => {

            courseRepository.get(course.id)
              .then((courseDetails) => {
                extend(listOfCourseGroup[indexCourseGroup].courses[indexCourse], courseDetails);
              });
          });
        });
        return listOfCourseGroup;
      })
      .then((listOfCourseGroup) => {
        reply(courseGroupSerializer.serializeArray(listOfCourseGroup));
      });

  }
};
