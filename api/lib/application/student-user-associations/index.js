const schoolingRegistrationUserAssociationController = require('./../schooling-registration-user-associations/schooling-registration-user-association-controller');
const Joi = require('@hapi/joi').extend(require('@hapi/joi-date'));
const JSONAPIError = require('jsonapi-serializer').Error;

exports.register = async function(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/student-user-associations',
      config: {
        handler: schoolingRegistrationUserAssociationController.associate,
        validate: {
          options: {
            allowUnknown: true
          },
          payload: Joi.object({
            data: {
              attributes: {
                'first-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                'last-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                'birthdate': Joi.date().format('YYYY-MM-DD').required(),
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
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Elle associe des données de l’utilisateur qui fait la requete, à l\'élève de l’organisation' +
          '- L\'utilisation de cette route est dépréciée. Utiliser /api/schooling-registration-user-associations à la place',
        ],
        tags: ['api', 'studentUserAssociation']
      }
    },
    {
      method: 'GET',
      path: '/api/student-user-associations',
      config: {
        handler: schoolingRegistrationUserAssociationController.findAssociation,
        notes : [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération du student (au sein d’une organisation) lié au user\n' +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié' +
          '- L\'utilisation de cette route est dépréciée. Utiliser /api/schooling-registration-user-associations à la place',
        ],
        tags: ['api', 'studentUserAssociation']
      }
    },
    {
      method: 'PUT',
      path: '/api/student-user-associations/possibilities',
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
          '- Elle permet de savoir si un élève identifié par son nom, prénom et date de naissance est présent au sein ' +
          'de l\'organisation détenant la campagne. Cet élève n\'est, de plus, pas encore associé à l\'organisation.' +
          '- L\'utilisation de cette route est dépréciée. Utiliser /api/schooling-registration-user-associations à la place',
        ],
        tags: ['api', 'studentUserAssociation']
      }
    }
  ]);
};

exports.name = 'student-user-associations-api';
