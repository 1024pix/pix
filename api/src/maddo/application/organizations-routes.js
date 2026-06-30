import Joi from 'joi';

import { identifiersType } from '../../shared/domain/types/identifiers-type.js';
import { responseObjectErrorDoc } from '../../shared/infrastructure/open-api-doc/response-object-error-doc.js';
import { getOrganizationCampaigns, getOrganizations } from './organizations-controller.js';
import { isOrganizationInJurisdictionPreHandler, organizationPreHandler } from './pre-handlers.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/organizations',
      config: {
        auth: { access: { scope: 'meta' } },
        pre: [organizationPreHandler],
        handler: getOrganizations,
        description: 'Lister les organisations Pix Orga.',
        notes: [
          'Retourne la liste des organisations auxquelles l’application cliente a droit.',
          '**Cette route nécessite le scope meta.**',
        ],
        tags: ['api', 'meta'],
        response: {
          failAction: 'log',
          status: {
            200: Joi.array()
              .items(
                Joi.object({
                  id: Joi.number().description("ID de l'organisation"),
                  name: Joi.string().description("Nom de l'organisation"),
                  externalId: Joi.string().description("ID externe de l'organisation"),
                }).label('Organization'),
              )
              .label('Organizations'),
            401: responseObjectErrorDoc,
            403: responseObjectErrorDoc,
          },
        },
      },
    },
    {
      method: 'GET',
      path: '/api/organizations/{organizationId}/campaigns',
      config: {
        auth: { access: { scope: 'campaigns' } },
        validate: {
          params: Joi.object({
            organizationId: identifiersType.organizationId,
          }),
          query: Joi.object({
            page: Joi.object({
              size: Joi.number().default(1000),
              number: Joi.number().default(1),
            })
              .default({
                size: 1000,
                number: 1,
              })
              .description('Informations de pagination'),
          }),
        },
        pre: [organizationPreHandler, isOrganizationInJurisdictionPreHandler],
        handler: getOrganizationCampaigns,
        description: 'Lister les campagnes d’une organisation.',
        notes: [
          'Retourne la liste des campagnes de l’organisation avec l’identifiant `organizationId`.',
          '**Cette route nécessite le scope campaigns.**',
        ],
        tags: ['api', 'meta'],
        response: {
          failAction: 'log',
          status: {
            200: Joi.object({
              campaigns: Joi.array()
                .items(
                  Joi.object({
                    id: Joi.number().description('ID de la campagne'),
                    name: Joi.string().description('Nom de la campagne'),
                    type: Joi.string().description('Type de la campagne : ASSESSMENT, EXAM, PROFILES_COLLECTION'),
                    targetProfileName: Joi.string().description(
                      'Nom du profil cible lié à la campagne, null si le type de la campagne est `PROFILES_COLLECTION`',
                    ),
                    code: Joi.string().description('Code campagne'),
                    createdAt: Joi.date().description('Date de création de la campagne'),
                    archivedAt: Joi.date().description("Date d'archivage de la campagne"),
                  }).label('Campaign'),
                )
                .label('Campaigns'),
              page: Joi.object({
                number: Joi.number().description('Numéro de la page courante'),
                size: Joi.number().description('Taille de la page courante'),
                count: Joi.number().description('Nombre total de page'),
              }).description('Information de pagination'),
            }).label('CampaignsResult'),
            401: responseObjectErrorDoc,
            403: responseObjectErrorDoc,
          },
        },
      },
    },
  ]);
};

export const organizationsRoute = { name: 'maddo/maddo-meta-api', register };
