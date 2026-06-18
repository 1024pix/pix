import JoiDate from '@joi/date';
import BaseJoi from 'joi';

const Joi = BaseJoi.extend(JoiDate);

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { ScoOrganizationTagName } from '../domain/models/ScoOrganizationTagName.js';
import { scoBlockedAccessDatesController } from './sco-blocked-access-dates-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'PATCH',
      path: '/api/admin/sco-blocked-access-dates/{key}',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([securityPreHandlers.checkAdminMemberHasRoleSuperAdmin])(
                request,
                h,
              ),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          params: Joi.object({
            key: Joi.string()
              .required()
              .valid(...Object.values(ScoOrganizationTagName)),
          }),
          payload: Joi.object({
            data: Joi.object({
              attributes: Joi.object({
                value: Joi.date().format('YYYY-MM-DD').required(),
              }).required(),
            }).required(),
          }),
        },
        handler: scoBlockedAccessDatesController.updateScoBlockedAccessDate,
        tags: ['api', 'admin'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin',
          'Elle permet de mettre a jour les dates de blocage SCO.',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/sco-blocked-access-dates',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasRoleSuperAdmin',
          },
        ],
        handler: scoBlockedAccessDatesController.getScoBlockedAccessDates,
        tags: ['api', 'admin'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin',
          'Elle permet de récupérer les dates de blocage SCO.',
        ],
      },
    },
  ]);
};

export const scoBlockedAccessDatesRoute = {
  name: 'certification/configuration/sco-blocked-access-dates-api',
  register,
};
