const Joi = require('joi');
const answerController = require('./answer-controller.js');
const identifiersType = require('../../domain/types/identifiers-type.js');
const { NotFoundError } = require('../../domain/errors.js');

exports.register = async (server) => {
  server.route([
    {
      method: 'POST',
      path: '/api/answers',
      config: {
        auth: false,
        validate: {
          payload: Joi.object({
            data: Joi.object({
              attributes: Joi.object({
                value: Joi.string().allow('').allow(null),
                result: Joi.string().allow(null),
                'result-details': Joi.string().allow(null),
                timeout: Joi.number().allow(null),
                'focused-out': Joi.boolean().allow(null),
              }).required(),
              relationships: Joi.object().required(),
              assessment: Joi.object(),
              challenge: Joi.object(),
              type: Joi.string(),
            }).required(),
          }).required(),
        },
        handler: answerController.save,
        tags: ['api', 'answers'],
        notes: [
          "- **Cette route est accessible aux utilisateurs pour qui l'answer appartient à leur assessment**\n" +
            '- Enregistre une réponse à un challenge',
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/pix1d/answers',
      config: {
        auth: false,
        validate: {
          payload: Joi.object({
            data: {
              attributes: {
                value: Joi.string().allow('').allow(null),
                result: Joi.string().allow(null),
                'result-details': Joi.string().allow(null),
              },
              relationships: Joi.object().required(),
              challenge: Joi.object(),
              type: Joi.string(),
            },
          }),
        },
        handler: answerController.saveForPix1D,
        tags: ['api', 'pix1d', 'answers'],
        notes: [
          "- **Cette route est accessible aux utilisateurs pour qui l'answer appartient à leur assessment**\n" +
            '- Enregistre une réponse à un challenge pour Pix 1D',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/answers/{id}',
      config: {
        auth: false,
        validate: {
          params: Joi.object({
            id: identifiersType.answerId,
          }),
        },
        handler: answerController.get,
        tags: ['api', 'answers'],
        notes: [
          "- **Cette route est accessible aux utilisateurs pour qui l'answer appartient à leur assessment**\n" +
            '- Récupère la réponse',
        ],
      },
    },
    {
      method: 'PATCH',
      path: '/api/answers/{id}',
      config: {
        auth: false,
        validate: {
          params: Joi.object({
            id: identifiersType.answerId,
          }),
        },
        handler: answerController.update,
        tags: ['api', 'answers'],
        notes: [
          "- **Cette route est accessible aux utilisateurs pour qui l'answer appartient à leur assessment**\n" +
            '- Cette route ne fait rien actuellement',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/answers',
      config: {
        auth: false,
        handler: answerController.find,
        tags: ['api', 'answers'],
        notes: [
          "- **Cette route est accessible aux utilisateurs pour qui l'answer appartient à leur assessment**\n" +
            '- Récupère la réponse correspondant à un challenge pour un assessment, ou null sinon',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/answers/{id}/correction',
      config: {
        auth: false,
        validate: {
          params: Joi.object({
            id: identifiersType.answerId,
          }),
          failAction: (request) => {
            throw new NotFoundError(`Not found correction for answer of ID ${request.params.id}`);
          },
        },
        handler: answerController.getCorrection,
        tags: ['api', 'answers'],
        notes: [
          "- **Cette route est accessible aux utilisateurs pour qui l'answer appartient à leur assessment**\n" +
            '- Récupère la correction à une réponse',
        ],
      },
    },
  ]);
};

exports.name = 'answers-api';
