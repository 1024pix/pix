const certificationCandidatesController = require('./certification-candidates-controller');
const Joi = require('joi');
const identifiersType = require('../../domain/types/identifiers-type');

exports.register = async function (server) {
  server.route([
    {
      method: 'PATCH',
      path: '/api/certification-candidates/{id}',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.certificationCandidateId,
          }),
          payload: Joi.object({
            'authorized-to-start': Joi.boolean().required(),
          }),
        },
        handler: certificationCandidatesController.update,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Indiquer la présence d'un candidat pour permettre ou bloquer son entrée en session",
        ],
        tags: ['api', 'certification-candidates'],
      },
    },
  ]);
};

exports.name = 'certification-candidates-api';
