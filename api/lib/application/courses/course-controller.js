const Boom = require('boom');
const courseRepository = require('../../infrastructure/repositories/course-repository');
const courseSerializer = require('../../infrastructure/serializers/course-serializer');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const challengeSerializer = require('../../infrastructure/serializers/challenge-serializer');
const cache = require('../../infrastructure/cache');

module.exports = {

  list(request, reply) {

    const key = 'course-controller_list';

    cache.get(key, (err, value) => {

      if (err) return reply(Boom.badImplementation(err));

      if (value) return reply(value);

      courseRepository
        .list()
        .then((courses) => {

          const response = courseSerializer.serializeArray(courses);

          const challengeIds = courses.reduce((a, b) => {
            return a.concat(b.challenges);
          }, []);

          const promises = challengeIds.map(challengeId => challengeRepository.get(challengeId));

          Promise.all(promises)
            .then(challenges => {
              response.included = challenges.map((challenge) => challengeSerializer.serialize(challenge).data);

              cache.set(key, response);

              return reply(response);
            })
            .catch(err => reply(Boom.badImplementation(err)));
        })
        .catch((err) => reply(Boom.badImplementation(err)));

    });
  },

  get(request, reply) {

    courseRepository
      .get(request.params.id)
      .then((course) => {

        const response = courseSerializer.serialize(course);

        const promises = course.challenges.map(challengeId => challengeRepository.get(challengeId));

        Promise.all(promises)
          .then(challenges => {
            response.included = challenges.map((challenge) => challengeSerializer.serialize(challenge).data);
            return reply(response);
          })
          .catch((err) => reply(Boom.badImplementation(err)));

      })
      .catch((err) => reply(Boom.badImplementation(err)));
  }

};

