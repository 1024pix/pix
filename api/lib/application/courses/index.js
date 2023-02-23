const Joi = require('joi');

const courseController = require('./course-controller.js');
const identifiersType = require('../../domain/types/identifiers-type.js');

exports.register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/courses/{id}',
      config: {
        auth: false,
        validate: {
          params: Joi.object({
            id: identifiersType.courseId,
          }),
        },
        handler: courseController.get,
        tags: ['api'],
      },
    },
  ]);
};

exports.name = 'courses-api';
