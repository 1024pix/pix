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
            since: Joi.date().iso().optional(),
            page: Joi.object({
              number: Joi.number().integer().empty('').allow(null).optional(),
              size: Joi.number().integer().max(200).empty('').allow(null).optional(),
            }).default({}),
            sort: Joi.array().items(
              Joi.object({
                value: Joi.string().empty('').allow(null).optional(),
                type: Joi.string().valid('asc', 'desc').empty(['', null]).allow(null).optional(),
              }),
            ),
            authenticationRequestedData: Joi.alternatives(Joi.array().items(Joi.string()), Joi.string()).optional(),
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
                    authenticationId: Joi.number().description(
                      'Si le participant a du utiliser un service SSO externe pour accéder à la campagne, on retourne son identifiant',
                    ),
                    authenticationRequestedData: Joi.object()
                      .optional()
                      .description(
                        "Données d'authentification du provider demandées via le paramètre de requête `authenticationRequestedData`",
                      ),
                    participantId: Joi.number().description('ID du participant'),
                    participantFirstName: Joi.string().description('Prénom du participant'),
                    participantLastName: Joi.string().description('Nom du participant'),
                    participantExternalId: Joi.string().description(
                      'Identifiant Externe rempli en début de participation',
                    ),
                    status: Joi.string().description('Statut de la participation : STARTED, SHARED'),
                    sharedAt: Joi.date().description('Date de participation'),
                    campaignId: Joi.number().description('ID de la campagne liée à la participation'),
                    organizationLearnerId: Joi.number().description("ID du participant au sein de l'organisation"),
                    pixScore: Joi.number().description(
                      'Score en pix pour une participation à une campagne de collecte de profil',
                    ),
                    masteryRate: Joi.number().description(
                      "Taux de réussite, i.e. pourcentage d'acquis validés dans la campagne",
                    ),
                    stages: Joi.object({
                      reachedStage: Joi.number().description('Palier atteint dans la campagne'),
                      numberOfStages: Joi.number().description('Nombre total de paliers dans la campagne'),
                    })
                      .description(
                        'Paliers associés à la participation à la campagne, null si le type de la campagne est `PROFILES_COLLECTION`',
                      )
                      .label('CampaignParticipationStages'),
                    badges: Joi.array()
                      .items(
                        Joi.object({
                          id: Joi.number().description('ID du badge'),
                          message: Joi.string().description('Message du badge'),
                          altMessage: Joi.string().description('Message alternatif du badge'),
                          imageUrl: Joi.string().description("URL de l'image du badge"),
                          key: Joi.string().description('Clé unique du badge'),
                          title: Joi.string().description('Titre du badge'),
                          isAcquired: Joi.boolean().description('Indique si le badge a été obtenu'),
                          acquisitionPercentage: Joi.number()
                            .min(0)
                            .max(100)
                            .description("Le pourcentage d'obtention du badge"),
                        }).label('CampaignParticipationBadge'),
                      )
                      .description(
                        'Badges associés à la participation à la campagne, null si le type de la campagne est `PROFILES_COLLECTION`',
                      )
                      .label('CampaignParticipationBadges'),
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
                        "Sujets évalués dans la campagne ou sujets liés au profil cible pour une campagne de collecte de profil, vide si la campagne n'est pas encore partagée",
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

export const campaignsRoute = { name: 'maddo/maddo-campaigns-api', register };
