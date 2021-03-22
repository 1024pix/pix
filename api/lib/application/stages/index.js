const securityPreHandlers = require('../security-pre-handlers');
const stagesController = require('./stages-controller');
const Joi = require('joi');
const identifiersType = require('../../domain/types/identifiers-type');

exports.register = async function(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/stages',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        handler: stagesController.create,
        tags: ['api', 'stages'],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/stages/{id}',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        validate: {
          params: Joi.object({
            id: identifiersType.stageId,
          }),
        },
        handler: stagesController.getStageDetails,
        tags: ['api', 'stages'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
          '- Elle permet de récupérer un palier.',
        ],
      },
    },
    {
      method: 'PATCH',
      path: '/api/admin/stages/{id}',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        validate: {
          params: Joi.object({
            id: identifiersType.stageId,
          }),
          payload: Joi.object({
            data: {
              attributes: {
                'prescriber-title': Joi.string().required().allow(null),
                'prescriber-description': Joi.string().required().allow(null),
              },
            },
          }).options({ allowUnknown: true }),
        },
        handler: stagesController.updateStage,
        tags: ['api', 'stages'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
          '- Elle permet de mettre à jour le prescriberTitle et le prescriberDescription d\'un palier.',
        ],
      },
    },
  ]);
};

exports.name = 'stages-api';
