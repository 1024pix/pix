import Joi from 'joi';

import { identifiersType } from '../../shared/domain/types/identifiers-type.js';
import { responseObjectErrorDoc } from '../../shared/infrastructure/open-api-doc/response-object-error-doc.js';
import { getCampaignParticipations } from './campaigns-controller.js';
import { isCampaignInJurisdictionPreHandler, organizationPreHandler } from './pre-handlers.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/campaigns/{campaignId}/participations',
      config: {
        auth: { access: { scope: 'campaigns' } },
        validate: {
          params: Joi.object({
            campaignId: identifiersType.campaignId,
          }),
          query: Joi.object({
            page: Joi.object({
              number: Joi.number().integer().empty('').allow(null).optional(),
              size: Joi.number().integer().max(200).empty('').allow(null).optional(),
            }).default({}),
          }),
        },
        pre: [organizationPreHandler, isCampaignInJurisdictionPreHandler],
        handler: getCampaignParticipations,
        description: 'Lister les résultats d’une campagne',
        notes: [
          'Retourne les résultats de la campagne avec l’identifiant `campaignId`.',
          '**Cette route nécessite le scope campaigns.**',
        ],
        tags: ['api', 'campaigns', 'maddo'],
        response: {
          failAction: 'log',
          status: {
            200: Joi.object({
              campaignParticipations: Joi.array()
                .items(
                  Joi.object({
                    id: Joi.number().description('ID de la participation à la campagne'),
                    createdAt: Joi.date().description('Date de début de participation'),
                    participantExternalId: Joi.string().description(
                      'Identifiant Externe rempli en début de participation',
                    ),
                    status: Joi.string().description('Statut de la participation : STARTED, TO_SHARE, SHARED'),
                    sharedAt: Joi.date().description('Date de participation'),
                    campaignId: Joi.number().description('ID de la campagne liée à la participation'),
                    userId: Joi.number().description('ID utilisateur du participant'),
                    organizationLearnerId: Joi.number().description("ID du participant au sein de l'organisation"),
                    pixScore: Joi.number().description(
                      'Score en pix pour une participation à une campagne de collecte de profil',
                    ),
                    masteryRate: Joi.number().description(
                      "Taux de réussite, i.e. pourcentage d'acquis validés dans la campagne",
                    ),
                    tubes: Joi.array()
                      .items(
                        Joi.object({
                          competenceId: Joi.string().description('ID de la compétence auquel appartient le sujet'),
                          id: Joi.string().description('ID du sujet'),
                          maxLevel: Joi.number().description('Niveau maximum atteignable dans cette campagne'),
                          reachedLevel: Joi.number().description('Niveau obtenu dans cette campagne'),
                          practicalDescription: Joi.string().description('Description du sujet'),
                          practicalTitle: Joi.string().description('Titre du sujet'),
                        }).label('CampaignParticipationTube'),
                      )
                      .description(
                        'Sujets évalués dans la campagne, null si le type de la campagne est `PROFILES_COLLECTION`',
                      )
                      .label('CampaignParticipationTubes'),
                  }).label('CampaignParticipation'),
                )
                .label('CampaignParticipations'),
              page: Joi.object({
                number: Joi.number().description('Numéro de la page courante'),
                size: Joi.number().description('Taille de la page courante'),
                count: Joi.number().description('Nombre total de page'),
              }).description('Information de pagination'),
            }).label('CampaignParticipationsResult'),
            401: responseObjectErrorDoc,
            403: responseObjectErrorDoc,
          },
        },
      },
    },
  ]);
};

const name = 'maddo-campaigns-api';
export { name, register };
