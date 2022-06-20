const Joi = require('joi').extend(require('@joi/date'));

const { sendJsonApiError, UnprocessableEntityError, NotFoundError } = require('../http-errors');
const securityPreHandlers = require('../security-pre-handlers');
const organizationLearnerUserAssociationController = require('./organization-learner-user-association-controller');
const identifiersType = require('../../domain/types/identifiers-type');

exports.register = async function (server) {
  const adminRoutes = [
    {
      method: 'DELETE',
      path: '/api/admin/schooling-registration-user-associations/{id}',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.userHasAtLeastOneAccessOf([
                securityPreHandlers.checkUserHasRoleSuperAdmin,
                securityPreHandlers.checkUserHasRoleSupport,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: organizationLearnerUserAssociationController.dissociate,
        validate: {
          params: Joi.object({
            id: identifiersType.schoolingRegistrationId,
          }),
        },
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle dissocie un utilisateur d’une inscription d’élève',
        ],
        tags: ['api', 'admin', 'organizationLearnerUserAssociation'],
      },
    },
  ];

  server.route([
    ...adminRoutes,
    {
      method: 'POST',
      path: '/api/schooling-registration-user-associations',
      config: {
        handler: organizationLearnerUserAssociationController.reconcileOrganizationLearnerManually,
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
        ],
        tags: ['api', 'organizationLearnerUserAssociation'],
      },
    },
    {
      method: 'POST',
      path: '/api/schooling-registration-user-associations/student',
      config: {
        handler: organizationLearnerUserAssociationController.reconcileSupOrganizationLearner,
        validate: {
          options: {
            allowUnknown: false,
          },
          payload: Joi.object({
            data: {
              attributes: {
                'student-number': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
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
            '- Elle réconcilie l’utilisateur à l’inscription d’un étudiant dans cette organisation',
        ],
        tags: ['api', 'organizationLearnerUserAssociation'],
      },
    },
    {
      method: 'POST',
      path: '/api/schooling-registration-user-associations/auto',
      config: {
        handler: organizationLearnerUserAssociationController.reconcileOrganizationLearnerAutomatically,
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
        ],
        tags: ['api', 'organizationLearnerUserAssociation'],
      },
    },
    {
      method: 'GET',
      path: '/api/schooling-registration-user-associations',
      config: {
        handler: organizationLearnerUserAssociationController.findAssociation,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Récupération de l'inscription de l'élève à l'organisation, et de l'utilisateur associé\n" +
            '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'organizationLearnerUserAssociation'],
      },
    },
    {
      method: 'PUT',
      path: '/api/schooling-registration-user-associations/possibilities',
      config: {
        auth: false,
        handler: organizationLearnerUserAssociationController.generateUsername,
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
        tags: ['api', 'organizationLearnerUserAssociation'],
      },
    },

    {
      method: 'PATCH',
      path: '/api/organizations/{id}/schooling-registration-user-associations/{schoolingRegistrationId}',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserIsAdminInSUPOrganizationManagingStudents,
          },
        ],
        handler: organizationLearnerUserAssociationController.updateStudentNumber,
        validate: {
          options: {
            allowUnknown: true,
          },
          params: Joi.object({
            id: identifiersType.organizationId,
            schoolingRegistrationId: identifiersType.schoolingRegistrationId,
          }),
          payload: Joi.object({
            data: {
              attributes: {
                'student-number': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
              },
            },
          }),
          failAction: (request, h, err) => {
            const isStudentNumber = err.details[0].path.includes('student-number');
            if (isStudentNumber) {
              return sendJsonApiError(new UnprocessableEntityError('Un des champs saisis n’est pas valide.'), h);
            }
            return sendJsonApiError(new NotFoundError('Ressource non trouvée'), h);
          },
        },
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés et admin au sein de l'orga**\n" +
            '- Elle met à jour le numéro étudiant',
        ],
        tags: ['api', 'organizationLearnerUserAssociation'],
      },
    },

    {
      method: 'DELETE',
      path: '/api/schooling-registration-user-associations/{id}',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.userHasAtLeastOneAccessOf([
                securityPreHandlers.checkUserHasRoleSuperAdmin,
                securityPreHandlers.checkUserHasRoleCertif,
                securityPreHandlers.checkUserHasRoleSupport,
                securityPreHandlers.checkUserHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: organizationLearnerUserAssociationController.dissociate,
        validate: {
          params: Joi.object({
            id: identifiersType.schoolingRegistrationId,
          }),
        },
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle dissocie un utilisateur d’une inscription d’élève',
        ],
        tags: ['api', 'admin', 'schoolingRegistrationUserAssociation'],
      },
    },
  ]);
};

exports.name = 'schooling-registration-user-associations-api';
