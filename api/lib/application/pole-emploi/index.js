import Joi from 'joi';
import poleEmploiController from './pole-emploi-controller';
import poleEmploiErreurDoc from '../../infrastructure/open-api-doc/pole-emploi/erreur-doc';
import poleEmploiEnvoisDoc from '../../infrastructure/open-api-doc/pole-emploi/envois-doc';

export const register = async function (server) {
  server.route([
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
  ]);
};

export const name = 'pole-emploi-api';
