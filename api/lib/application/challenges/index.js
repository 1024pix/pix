const Joi = require('joi');

const challengeController = require('./challenge-controller');
const identifiersType = require('../../domain/types/identifiers-type');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/challenges/{id}',
      config: {
        auth: false,
        validate: {
          params: Joi.object({
            id: identifiersType.challengeId,
          }),
        },
        handler: challengeController.get,
        tags: ['api'],
      },
    },
  ]);
};

exports.name = 'challenges-api';
