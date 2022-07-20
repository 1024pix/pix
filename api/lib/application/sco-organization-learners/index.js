const Joi = require('joi').extend(require('@joi/date'));

const { sendJsonApiError, UnprocessableEntityError } = require('../http-errors');
const scoOrganizationLearnerController = require('./sco-organization-learner-controller');
const XRegExp = require('xregexp');
const { passwordValidationPattern } = require('../../config').account;

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
    {
      method: 'POST',
      path: '/api/schooling-registration-user-associations/auto',
      config: {
        handler: scoOrganizationLearnerController.reconcileScoOrganizationLearnerAutomatically,
        validate: {
          options: {
            allowUnknown: false,
          },
          payload: Joi.object({
            data: {
              attributes: {
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
            '- Elle essaye d’associer automatiquement l’utilisateur à l’inscription de l’élève dans cette organisation',
          "- L'usage de cette route est **dépréciée** en faveur de /api/sco-organization-learners/association/auto",
        ],
        tags: ['api', 'organizationLearnerUserAssociation'],
      },
    },
    {
      method: 'POST',
      path: '/api/sco-organization-learners/association/auto',
      config: {
        handler: scoOrganizationLearnerController.reconcileScoOrganizationLearnerAutomatically,
        validate: {
          options: {
            allowUnknown: false,
          },
          payload: Joi.object({
            data: {
              attributes: {
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
            '- Elle essaye d’associer automatiquement l’utilisateur à l’inscription de l’élève dans cette organisation',
        ],
        tags: ['api', 'sco-organization-learners'],
      },
    },
    {
      method: 'PUT',
      path: '/api/schooling-registration-user-associations/possibilities',
      config: {
        auth: false,
        handler: scoOrganizationLearnerController.generateUsername,
        validate: {
          options: {
            allowUnknown: true,
          },
          payload: Joi.object({
            data: {
              attributes: {
                'first-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                'last-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                birthdate: Joi.date().format('YYYY-MM-DD').raw().required(),
                'campaign-code': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
              },
            },
          }),
          failAction: (request, h) => {
            return sendJsonApiError(new UnprocessableEntityError('Un des champs saisis n’est pas valide.'), h);
          },
        },
        notes: [
          '- Elle permet de savoir si un élève identifié par son nom, prénom et date de naissance est inscrit à ' +
            "l'organisation détenant la campagne. Cet élève n'est, de plus, pas encore associé à l'organisation.",
          "- L'usage de cette route est **dépréciée** en faveur de /api/sco-organization-learners/possibilities",
        ],
        tags: ['api', 'organizationLearnerUserAssociation'],
      },
    },
    {
      method: 'PUT',
      path: '/api/sco-organization-learners/possibilities',
      config: {
        auth: false,
        handler: scoOrganizationLearnerController.generateUsername,
        validate: {
          options: {
            allowUnknown: true,
          },
          payload: Joi.object({
            data: {
              attributes: {
                'first-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                'last-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                birthdate: Joi.date().format('YYYY-MM-DD').raw().required(),
                'campaign-code': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
              },
            },
          }),
          failAction: (request, h) => {
            return sendJsonApiError(new UnprocessableEntityError('Un des champs saisis n’est pas valide.'), h);
          },
        },
        notes: [
          '- Elle permet de savoir si un élève identifié par son nom, prénom et date de naissance est inscrit à ' +
            "l'organisation détenant la campagne. Cet élève n'est, de plus, pas encore associé à l'organisation.",
        ],
        tags: ['api', 'sco-organization-learners'],
      },
    },
    {
      method: 'POST',
      path: '/api/schooling-registration-dependent-users',
      config: {
        auth: false,
        handler: scoOrganizationLearnerController.createAndReconcileUserToOrganizationLearner,
        validate: {
          options: {
            allowUnknown: true,
          },
          payload: Joi.object({
            data: {
              attributes: {
                'first-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                'last-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                birthdate: Joi.date().format('YYYY-MM-DD').raw().required(),
                'campaign-code': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                password: Joi.string().pattern(XRegExp(passwordValidationPattern)).required(),
                'with-username': Joi.boolean().required(),
                username: Joi.string().pattern(XRegExp('^([a-z]+[.]+[a-z]+[0-9]{4})$')).allow(null),
              },
            },
          }),
        },
        notes: [
          "Cette route crée un utilisateur et l'associe à l'élève trouvé au sein de l'organisation à laquelle " +
            'appartient la campagne spécifiée \n',
          "- L'usage de cette route est **dépréciée** en faveur de /api/sco-organization-learners/dependent",
        ],
        tags: ['api', 'organizationLearnerDependentUser'],
      },
    },
    {
      method: 'POST',
      path: '/api/sco-organization-learners/dependent',
      config: {
        auth: false,
        handler: scoOrganizationLearnerController.createAndReconcileUserToOrganizationLearner,
        validate: {
          options: {
            allowUnknown: true,
          },
          payload: Joi.object({
            data: {
              attributes: {
                'first-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                'last-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                birthdate: Joi.date().format('YYYY-MM-DD').raw().required(),
                'campaign-code': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                password: Joi.string().pattern(XRegExp(passwordValidationPattern)).required(),
                'with-username': Joi.boolean().required(),
                username: Joi.string().pattern(XRegExp('^([a-z]+[.]+[a-z]+[0-9]{4})$')).allow(null),
              },
            },
          }),
        },
        notes: [
          "Cette route crée un utilisateur et l'associe à l'élève trouvé au sein de l'organisation à laquelle " +
            'appartient la campagne spécifiée',
        ],
        tags: ['api', 'sco-organization-learners'],
      },
    },
  ]);
};

exports.name = 'sco-organization-learners-api';
