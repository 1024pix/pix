const Joi = require('joi').extend(require('@joi/date'));

const { sendJsonApiError, UnprocessableEntityError } = require('../http-errors');
const scoOrganizationLearnerController = require('./sco-organization-learner-controller');

exports.register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/schooling-registration-user-associations',
      config: {
        handler: scoOrganizationLearnerController.reconcileScoOrganizationLearnerManually,
        validate: {
          options: {
            allowUnknown: false,
          },
          payload: Joi.object({
            data: {
              attributes: {
                'first-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                'last-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                birthdate: Joi.date().format('YYYY-MM-DD').required(),
                'campaign-code': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
              },
              type: 'schooling-registration-user-associations',
            },
          }),
          failAction: (request, h) => {
            return sendJsonApiError(new UnprocessableEntityError('Un des champs saisis n’est pas valide.'), h);
          },
        },
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Elle associe des données saisies par l’utilisateur à l’inscription de l’élève dans cette organisation',
          "- L'usage de cette route est **dépréciée** en faveur de /api/sco-organization-learners/association",
        ],
        tags: ['api', 'organizationLearnerUserAssociation'],
      },
    },
    {
      method: 'POST',
      path: '/api/sco-organization-learners/association',
      config: {
        handler: scoOrganizationLearnerController.reconcileScoOrganizationLearnerManually,
        validate: {
          options: {
            allowUnknown: false,
          },
          payload: Joi.object({
            data: {
              attributes: {
                'first-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                'last-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                birthdate: Joi.date().format('YYYY-MM-DD').required(),
                'campaign-code': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
              },
              type: 'sco-organization-learners',
            },
          }),
          failAction: (request, h) => {
            return sendJsonApiError(new UnprocessableEntityError('Un des champs saisis n’est pas valide.'), h);
          },
        },
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Elle associe des données saisies par l’utilisateur à l’inscription de l’élève dans cette organisation',
        ],
        tags: ['api', 'sco-organization-learners'],
      },
    },
  ]);
};

exports.name = 'sco-organization-learners-api';
