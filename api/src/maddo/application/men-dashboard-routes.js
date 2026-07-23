import Joi from 'joi';

import { pageQuerySchema } from '../../shared/application/pagination-query-schema.js';
import { responseObjectErrorDoc } from '../../shared/infrastructure/open-api-doc/response-object-error-doc.js';
import {
  getMenDashboardCertificationDataset,
  getMenDashboardParticipationDataset,
} from './men-dashboard-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/men/dashboard/certifications',
      config: {
        auth: { access: { scope: 'men-dashboard' } },
        validate: {
          query: Joi.object({
            page: pageQuerySchema,
          }),
        },
        handler: getMenDashboardCertificationDataset,
        description:
          'Dataset contenant les statistiques sur la certification des élèves des établissements français pour ' +
          "l'année scolaire en cours par niveau scolaire et compétence.",
        notes: [
          'Retourne toutes les données triées par UAI sous format paginé.',
          '**Cette route nécessite le scope men-dashboard.**',
        ],
        tags: ['api', 'men-dashboard', 'maddo'],
        response: {
          failAction: 'log',
          status: {
            200: Joi.object({
              dataset: Joi.array().items(
                Joi.object({
                  schoolUai: Joi.string().description("UAI de l'établissement"),
                  schoolYear: Joi.number().description('Année scolaire concernée par les données'),
                  academieName: Joi.string().description("Nom de l'académie de l'établissement"),
                  schoolName: Joi.string().description("Nom de l'établissement"),
                  provinceCode: Joi.string().description("Numéro du département de l'établissement sur 3 caractères"),
                  schoolYearGroup: Joi.string().description('Niveau scolaire'),
                  validatedCertificationCount: Joi.number().description(
                    'Nombre de certification obtenues (i.e. réussies)',
                  ),
                  certificationCount: Joi.number().description(
                    'Nombre total de certifications (réussies, échouées, abandonnées...)',
                  ),
                  averagePixScore: Joi.number().description(
                    "Moyenne des scores en 'Pix' réalisés sur les certifications obtenues pour une compétence donnée",
                  ),
                  competenceCode: Joi.string().description('Code de la compétence'),
                  avgCompetenceLevel: Joi.number().description(
                    'Moyenne des niveaux atteints sur les certifications obtenues pour une compétence donnée',
                  ),
                  updatedAt: Joi.date().description('Date de dernière mise à jour des données.'),
                }).label('MenDashboardCertificationRow'),
              ),
              page: Joi.object({
                number: Joi.number().description('Numéro de la page courante'),
                size: Joi.number().description('Taille de la page courante'),
                count: Joi.number().description('Nombre total de pages'),
              })
                .description('Information de pagination')
                .label('page'),
            }).label('MenDashboardCertificationDataset'),
            401: responseObjectErrorDoc,
            403: responseObjectErrorDoc,
          },
        },
      },
    },
    {
      method: 'GET',
      path: '/api/men/dashboard/participations',
      config: {
        auth: { access: { scope: 'men-dashboard' } },
        validate: {
          query: Joi.object({
            page: pageQuerySchema,
          }),
        },
        handler: getMenDashboardParticipationDataset,
        description:
          'Dataset contenant les statistiques de participation aux campagnes de rentrée des élèves des établissements français pour ' +
          "l'année scolaire en cours par niveau scolaire et compétence.",
        notes: [
          'Retourne toutes les données triées par UAI sous format paginé.',
          '**Cette route nécessite le scope men-dashboard.**',
        ],
        tags: ['api', 'men-dashboard', 'maddo'],
        response: {
          failAction: 'log',
          status: {
            200: Joi.object({
              dataset: Joi.array().items(
                Joi.object({
                  schoolUai: Joi.string().description("UAI de l'établissement"),
                  schoolYear: Joi.number().description('Année scolaire concernée par les données'),
                  academieName: Joi.string().description("Nom de l'académie de l'établissement"),
                  schoolName: Joi.string().description("Nom de l'établissement"),
                  provinceCode: Joi.string().description("Numéro du département de l'établissement sur 3 caractères"),
                  schoolYearGroup: Joi.string().description('Niveau scolaire'),
                  competenceCode: Joi.string().description('Code de la compétence'),
                  competenceName: Joi.string().description('Nom de la compétence'),
                  participantCount: Joi.number().description('Nombre de participants'),
                  standardDeviation: Joi.number().description('Écart-type des niveaux atteints'),
                  firstDecileLevel: Joi.number().description('Premier décile des niveaux atteints'),
                  firstQuartileLevel: Joi.number().description('Premier quartile des niveaux atteints'),
                  medianLevel: Joi.number().description('Niveau médian atteint'),
                  thirdQuartileLevel: Joi.number().description('Troisième quartile des niveaux atteints'),
                  ninthDecileLevel: Joi.number().description('Neuvième décile des niveaux atteints'),
                  averageMaxLevelReached: Joi.number().description('Moyenne des niveaux maximum atteints'),
                  averageMaxLevelReachable: Joi.number().description('Moyenne des niveaux maximum atteignables'),
                  coverage: Joi.number().description('Taux de couverture'),
                  updatedAt: Joi.date().description('Date de dernière mise à jour des données.'),
                }),
              ),
              page: Joi.object({
                number: Joi.number().description('Numéro de la page courante'),
                size: Joi.number().description('Taille de la page courante'),
                count: Joi.number().description('Nombre total de pages'),
              }).description('Information de pagination'),
            }).label('MENDashboardParticipationDataset'),
            401: responseObjectErrorDoc,
            403: responseObjectErrorDoc,
          },
        },
      },
    },
  ]);
};

export const menDashboardRoute = {
  name: 'maddo/maddo-men-dashboard-api',
  register,
};
