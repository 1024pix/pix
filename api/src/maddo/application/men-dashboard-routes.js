import Joi from 'joi';

import { responseObjectErrorDoc } from '../../shared/infrastructure/open-api-doc/response-object-error-doc.js';
import { getMenDashboardCertificationDataset } from './men-dashboard-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/men/dashboard/certifications',
      config: {
        auth: { access: { scope: 'men-dashboard' } },
        validate: {
          query: Joi.object({
            page: Joi.object({
              number: Joi.number().integer().empty('').allow(null).optional(),
              size: Joi.number().integer().max(200).empty('').allow(null).optional(),
            }).default({}),
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
                  provinceCode: Joi.string().description("Nom du département de l'établissement"),
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
  ]);
};

export const menDashboardRoute = {
  name: 'maddo/maddo-men-dashboard-api',
  register,
};
