const Joi = require('joi');
const poleEmploiController = require('./pole-emploi-controller');
const poleEmploiErreurDoc = require('../../infrastructure/open-api-doc/pole-emploi/erreur-doc');
const poleEmploiEnvoisDoc = require('../../infrastructure/open-api-doc/pole-emploi/envois-doc');
const PoleEmploiController = require('../pole-emploi/pole-emploi-controller');

exports.register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/pole-emploi/users',
      config: {
        auth: false,
        handler: poleEmploiController.createUser,
        tags: ['api'],
      },
    },
    {
      method: 'POST',
      path: '/api/pole-emplois/users',
      config: {
        auth: false,
        handler: poleEmploiController.createUser,
        tags: ['api'],
      },
    },
    {
      method: 'GET',
      path: '/api/pole-emploi/envois',
      config: {
        auth: 'jwt-pole-emploi',
        handler: poleEmploiController.getSendings,
        notes: [
          '- **API Pôle emploi qui nécessite une authentification de type client credential grant**\n' +
            '- Récupération des N derniers envois. Le résultat peut être paginé si plus de N entrées via le paramètre Link dans le header de la réponse\n',
        ],
        response: {
          failAction: 'ignore',
          status: {
            200: poleEmploiEnvoisDoc,
            204: poleEmploiEnvoisDoc,
            400: poleEmploiErreurDoc,
            401: poleEmploiErreurDoc,
            403: poleEmploiErreurDoc,
          },
        },
        plugins: {
          'hapi-swagger': {
            produces: ['application/json'],
          },
        },
        validate: {
          headers: Joi.object({
            authorization: Joi.string().description('Bearer Access token to access to API '),
            link: Joi.string()
              .optional()
              .example('https://gateway.pix.fr/pole-emploi/envois?curseur=1234')
              .description('Lien de récupération de la page suivante des résultats'),
          }).unknown(),
          query: Joi.object({
            curseur: Joi.string()
              .optional()
              .description('Identifiant du curseur permettant de récupérer les résultats suivants.'),
            enErreur: Joi.boolean()
              .optional()
              .description(
                "Permet de récupérer uniquement les résultats des participants dont l'envoi a échoué la première fois."
              ),
          }).options({ allowUnknown: true }),
        },
        tags: ['api', 'pole-emploi'],
      },
    },
    {
      method: 'GET',
      path: '/api/pole-emploi/auth-url',
      config: {
        auth: false,
        handler: PoleEmploiController.getAuthUrl,
        notes: [
          "- Cette route permet de récupérer l'url d'authentification de Pole emploi.\n" +
            '- Elle retournera également les valeurs state et nonce.',
        ],
        tags: ['api', 'Pôle emploi'],
      },
    },
  ]);
};

exports.name = 'pole-emploi-api';
