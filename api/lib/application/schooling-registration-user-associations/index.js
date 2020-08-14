const schoolingRegistrationUserAssociationController = require('./schooling-registration-user-association-controller');
const Joi = require('@hapi/joi').extend(require('@hapi/joi-date'));
const JSONAPIError = require('jsonapi-serializer').Error;

exports.register = async function(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/schooling-registration-user-associations',
      config: {
        handler: schoolingRegistrationUserAssociationController.reconcileManually,
        validate: {
          options: {
            allowUnknown: false
          },
          payload: Joi.alternatives().try(
            Joi.object({
              data: {
                attributes: {
                  'first-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                  'last-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                  'birthdate': Joi.date().format('YYYY-MM-DD').required(),
                  'campaign-code': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                },
                type: 'schooling-registration-user-associations'
              },
            }),
            Joi.object({
              data: {
                attributes: {
                  'student-number': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                  'first-name': Joi.string().allow(null).empty(Joi.string().regex(/^\s*$/)),
                  'last-name': Joi.string().allow(null).empty(Joi.string().regex(/^\s*$/)),
                  'birthdate': Joi.date().format('YYYY-MM-DD'),
                  'campaign-code': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                },
                type: 'schooling-registration-user-associations'
              }
            }),
          ),
          failAction: (request, h) => {
            const errorHttpStatusCode = 422;
            const jsonApiError = new JSONAPIError({
              status: errorHttpStatusCode.toString(),
              title: 'Unprocessable entity',
              detail: 'Un des champs saisis n’est pas valide.',
            });
            return h.response(jsonApiError).code(errorHttpStatusCode).takeover();
          }
        },
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Elle associe des données saisies par l’utilisateur à l’inscription de l’élève dans cette organisation\n' +
          '- L’utilisation de cette route avec uniquement le paramètre campaign-code est dépréciée en faveur de la route /auto'
        ],
        tags: ['api', 'schoolingRegistrationUserAssociation']
      }
    },
    {
      method: 'POST',
      path: '/api/schooling-registration-user-associations/register',
      config: {
        handler: schoolingRegistrationUserAssociationController.registerAdditionalHigherEducationRegistration,
        validate: {
          options: {
            allowUnknown: false
          },
          payload: 
            Joi.object({
              data: {
                attributes: {
                  'student-number': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                  'first-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                  'last-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                  'birthdate': Joi.date().format('YYYY-MM-DD').required(),
                  'campaign-code': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                },
                type: 'schooling-registration-user-associations'
              }
            }),
          failAction: (request, h) => {
            const errorHttpStatusCode = 422;
            const jsonApiError = new JSONAPIError({
              status: errorHttpStatusCode.toString(),
              title: 'Unprocessable entity',
              detail: 'Un des champs saisis n’est pas valide.',
            });
            return h.response(jsonApiError).code(errorHttpStatusCode).takeover();
          }
        },
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Elle créee une inscription surnuméraire pour l’utilisateur dans cette organisation\n'
        ],
        tags: ['api', 'schoolingRegistrationUserAssociation']
      }
    },
    {
      method: 'POST',
      path: '/api/schooling-registration-user-associations/auto',
      config: {
        handler: schoolingRegistrationUserAssociationController.reconcileAutomatically,
        validate: {
          options: {
            allowUnknown: false
          },
          payload: Joi.object({
            data: {
              attributes: {
                'campaign-code': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
              },
              type: 'schooling-registration-user-associations'
            }
          }),
          failAction: (request, h) => {
            const errorHttpStatusCode = 422;
            const jsonApiError = new JSONAPIError({
              status: errorHttpStatusCode.toString(),
              title: 'Unprocessable entity',
              detail: 'Un des champs saisis n’est pas valide.',
            });
            return h.response(jsonApiError).code(errorHttpStatusCode).takeover();
          }
        },
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Elle essaye d’associer automatiquement l’utilisateur à l’inscription de l’élève dans cette organisation'
        ],
        tags: ['api', 'schoolingRegistrationUserAssociation']
      }
    },
    {
      method: 'GET',
      path: '/api/schooling-registration-user-associations',
      config: {
        handler: schoolingRegistrationUserAssociationController.findAssociation,
        notes : [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération de l\'inscription de l\'élève à l\'organisation, et de l\'utilisateur associé\n' +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'schoolingRegistrationUserAssociation']
      }
    },
    {
      method: 'PUT',
      path: '/api/schooling-registration-user-associations/possibilities',
      config: {
        auth: false,
        handler: schoolingRegistrationUserAssociationController.generateUsername,
        validate: {
          options: {
            allowUnknown: true
          },
          payload: Joi.object({
            data: {
              attributes: {
                'first-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                'last-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                'birthdate': Joi.date().format('YYYY-MM-DD').raw().required(),
                'campaign-code': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
              },
            },
          }),
          failAction: (request, h) => {
            const errorHttpStatusCode = 422;
            const jsonApiError = new JSONAPIError({
              status: errorHttpStatusCode.toString(),
              title: 'Unprocessable entity',
              detail: 'Un des champs saisis n’est pas valide.',
            });
            return h.response(jsonApiError).code(errorHttpStatusCode).takeover();
          }
        },
        notes: [
          '- Elle permet de savoir si un élève identifié par son nom, prénom et date de naissance est inscrit à ' +
          'l\'organisation détenant la campagne. Cet élève n\'est, de plus, pas encore associé à l\'organisation.'
        ],
        tags: ['api', 'schoolingRegistrationUserAssociation']
      }
    },
    {
      method: 'DELETE',
      path: '/api/schooling-registration-user-associations',
      config: {
        handler: schoolingRegistrationUserAssociationController.dissociate,
        validate: {
          payload: Joi.object({
            data: {
              attributes: {
                'schooling-registration-id': Joi.number(),
              }
            }
          })
        },
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés et admin au sein de l\'orga**\n' +
          '- Elle dissocie un utilisateur d\'une inscription d’élève'
        ],
        tags: ['api', 'schoolingRegistrationUserAssociation']
      }
    },
  ]);
};

exports.name = 'schooling-registration-user-associations-api';
