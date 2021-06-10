const Joi = require('joi');
const poleEmploiController = require('./pole-emploi-controller');

const responseErrorObjectDoc = require('../../infrastructure/open-api-doc/pole-emploi/response-object-error-doc');
const poleEmploiEnvoisDoc = require('../../infrastructure/open-api-doc/pole-emploi/envois-doc');

exports.register = async function(server) {
  server.route([
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
        handler: console.log,
        notes: [
          '- **API for Pôle emploi qui nécessite une authentification de type client credential grant**\n' +
          '- Récupération des N derniers envois. Le résultat peut être paginé si plus de N entrées via le paramètre Link dans le header la réponse\n',
        ],
        response: {
          status: {
            200: poleEmploiEnvoisDoc,
            204: poleEmploiEnvoisDoc,
            403: responseErrorObjectDoc,
          },
        },
        plugins: {
          'hapi-swagger': {
            produces: ['application/json'],
          },
        },
        validate: {
          headers: Joi.object({
            'authorization': Joi.string().description('Bearer Access token to access to API '),
            'link': Joi.string().optional().example('https://gateway.pix.fr/v1/pole-emploi/envois?cursor=AAAAA').description('Lien de récupération de la page suivante des résultats'),
          }).unknown(),
          query: Joi.object({
            cursor: Joi.string().optional().description('Identifiant du curseur permettant de récupérer les résultats suivants.'),
            enErreur: Joi.boolean().optional().description('Permet de récupérer uniquement les résultats des participants dont l\'envoi a échoué la première fois.'),
          }).options({ allowUnknown: true }),
        },
        tags: ['api', 'pole-emploi'],
      },
    },
  ]);
};

exports.name = 'pole-emplois-api';
