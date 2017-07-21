const Boom = require('boom');
const courseRepository = require('../../infrastructure/repositories/course-repository');
const courseSerializer = require('../../infrastructure/serializers/jsonapi/course-serializer');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const challengeSerializer = require('../../infrastructure/serializers/jsonapi/challenge-serializer');

const logger = require('../../infrastructure/logger');

function _fetchCourses(query) {
  if (query.isAdaptive === 'true') {
    return courseRepository.getAdaptiveCourses();
  }
  if (query.isCourseOfTheWeek === 'true') {
    return courseRepository.getCoursesOfTheWeek();
  }
  return courseRepository.getProgressionCourses();
}

function _extractCoursesChallenges(courses) {
  const challengeIds = courses.reduce((listOfId, course) => {
    if (course.challenges) {
      return listOfId.concat(course.challenges);
    }
    return listOfId;
  }, []);
  const challenges = challengeIds.map(challengeId => challengeRepository.get(challengeId));
  return Promise.all(challenges);
}

function _buildResponse(courses, challenges) {
  const response = courseSerializer.serializeArray(courses);
  response.included = challenges.map(challenge => challengeSerializer.serialize(challenge).data);
  return response;
}

module.exports = {

  list(request, reply) {
    let courses;
    _fetchCourses(request.query)
      .then(fetchedCourses => {
        courses = fetchedCourses;
        return _extractCoursesChallenges(courses);
      })
      .then(challenges => reply(_buildResponse(courses, challenges)))
      .catch((err) => {
        logger.error(err);
        reply(Boom.badImplementation(err));
      });
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

        if ('MODEL_ID_NOT_FOUND' === err.error.type) {
          return reply(Boom.notFound(err));
        }

        logger.error(err);

        return reply(Boom.badImplementation(err));
      });
  },

  refresh(request, reply) {
    courseRepository
      .refresh(request.params.id)
      .then(course => reply(courseSerializer.serialize(course)))
      .catch((err) => {
        logger.error(err);
        reply(Boom.badImplementation(err));
      });
  },

  refreshAll(request, reply) {
    courseRepository
      .refreshAll()
      .then(() => reply('Courses updated'))
      .catch(reply);
  }

};

