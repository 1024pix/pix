const Boom = require('boom');
const courseRepository = require('../../infrastructure/repositories/course-repository');
const courseSerializer = require('../../infrastructure/serializers/jsonapi/course-serializer');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const challengeSerializer = require('../../infrastructure/serializers/jsonapi/challenge-serializer');

function _fetchCourses(query) {
  if (query.isAdaptive) {
    return courseRepository.getAdaptiveCourses();
  }
  if (query.isCourseOfTheWeek) {
    return courseRepository.getCoursesOfTheWeek();
  }
  return courseRepository.getProgressionTests();
}

module.exports = {

  list(request, reply) {
    _fetchCourses(request.query)
      .then(courses => {
        const response = courseSerializer.serializeArray(courses);
        const challengeIds = courses.reduce((listOfId, course) => {
          if (course.challenges) {
            return listOfId.concat(course.challenges);
          }
          return listOfId;
        }, []);
        const promises = challengeIds.map(challengeId => challengeRepository.get(challengeId));
        Promise.all(promises)
          .then(challenges => {
            response.included = challenges.map(challenge => challengeSerializer.serialize(challenge).data);
            return reply(response);
          })
          .catch(err => reply(Boom.badImplementation(err)));
      })
      .catch(err => reply(Boom.badImplementation(err)));
  },

  get(request, reply) {
    courseRepository
      .get(request.params.id)
      .then(course => {
        const response = courseSerializer.serialize(course);
        if (course.challenges) {
          const promises = course.challenges.map(challengeId => challengeRepository.get(challengeId));
          Promise.all(promises)
            .then(challenges => {
              response.included = challenges.map((challenge) => challengeSerializer.serialize(challenge).data);
              return reply(response);
            })
            .catch((err) => reply(Boom.badImplementation(err)));
        } else {
          return reply(response);
        }
      })
      .catch(err => {
        let error = Boom.badImplementation(err);
        if ('MODEL_ID_NOT_FOUND' == err.error.type) {
          error = Boom.notFound(err);
        }
        return reply(error);
      });
  },

  refresh(request, reply) {
    courseRepository
      .refresh(request.params.id)
      .then(course => reply(courseSerializer.serialize(course)))
      .catch(err => reply(Boom.badImplementation(err)));
  }

};

