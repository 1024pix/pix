import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { certificatePreviewController } from './certificate-preview-controller.js';

async function register(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/tools/certificate-preview',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          payload: Joi.object({
            locale: Joi.string().valid('fr', 'en').default('fr'),
            pixScore: Joi.number().integer().min(0).max(896).required(),
            competences: Joi.array()
              .items(
                Joi.object({
                  code: Joi.string().required(),
                  level: Joi.number().integer().min(0).max(8).required(),
                }),
              )
              .required(),
          }),
        },
        handler: certificatePreviewController.generateCertificatePreview,
        tags: ['api', 'admin', 'tools', 'certificate-preview'],
        notes: ['Génère un certificat PDF de prévisualisation à partir de données fictives (outil de dev)'],
      },
    },
  ]);
}

export const certificatePreviewRoute = {
  name: 'certification/results/certificate-preview-api',
  register,
};
