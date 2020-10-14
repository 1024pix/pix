const schoolingRegistrationUserAssociationController = require('./../schooling-registration-user-associations/schooling-registration-user-association-controller');
const Joi = require('@hapi/joi').extend(require('@hapi/joi-date'));
const { sendJsonApiError, UnprocessableEntityError } = require('../http-errors');

exports.register = async function(server) {
  server.route([
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
        tags: ['api', 'studentUserAssociation'],
      },
    },
    {
      method: 'PUT',
      path: '/api/student-user-associations/possibilities',
      config: {
        auth: false,
        handler: schoolingRegistrationUserAssociationController.generateUsername,
        validate: {
          options: {
            allowUnknown: true,
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
            return sendJsonApiError(new UnprocessableEntityError('Un des champs saisis n’est pas valide.'), h);
          },
        },
        notes: [
          '- Elle permet de savoir si un élève identifié par son nom, prénom et date de naissance est présent au sein ' +
          'de l\'organisation détenant la campagne. Cet élève n\'est, de plus, pas encore associé à l\'organisation.' +
          '- L\'utilisation de cette route est dépréciée. Utiliser /api/schooling-registration-user-associations à la place',
        ],
        tags: ['api', 'studentUserAssociation'],
      },
    },
  ]);
};

exports.name = 'student-user-associations-api';
