'use strict';

const Boom = require('boom');
const courseRepository = require('../repositories/course-repository');
const courseSerializer = require('../serializers/course-serializer');

module.exports = {

  list: {
    handler: (request, reply) => {

      courseRepository
        .list()
        .then((courses) => reply(courseSerializer.serializeArray(courses)))
        .catch((error) => reply(Boom.badImplementation(error)));
    }
  },

  get: {
    handler: (request, reply) => {

      courseRepository
        .get(request.params.id)
        .then((course) => reply(courseSerializer.serialize((course))))
        .catch((error) => reply(Boom.badImplementation(error)));
    }
  }

};
