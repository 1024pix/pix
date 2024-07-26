import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { erreurDoc } from '../../../shared/infrastructure/open-api-doc/pole-emploi/erreur-doc.js';
import { attachTargetProfileController } from './attach-target-profile-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'PUT',
      path: '/api/admin/complementary-certifications/{complementaryCertificationId}/badges',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasRoleSuperAdmin',
          },
        ],
        plugins: {
          'hapi-swagger': {
            produces: ['application/json'],
          },
        },
        validate: {
          params: Joi.object({
            complementaryCertificationId: identifiersType.complementaryCertificationId,
          }),
          payload: Joi.object({
            data: {
              attributes: {
                'target-profile-id': identifiersType.targetProfileId.optional(),
                'notify-organizations': Joi.boolean().required(),
                'complementary-certification-badges': Joi.array()
                  .items(
                    Joi.object({
                      data: {
                        attributes: Joi.object({
                          'badge-id': identifiersType.badgeId,
                          level: Joi.number().min(1).required(),
                          'image-url': Joi.string().required(),
                          label: Joi.string().required(),
                          'sticker-url': Joi.string().required(),
                          'certificate-message': Joi.string().empty(['', null]).optional(),
                          'temporary-certificate-message': Joi.string().empty(['', null]).optional(),
                          'minimum-earned-pix': Joi.number().empty(['', null]).optional(),
                        }),
                        relationships: Joi.object().required(),
                        type: Joi.string(),
                      },
                    }),
                  )
                  .required(),
              },
              type: Joi.string(),
            },
          }),
        },
        handler: attachTargetProfileController.attachTargetProfile,
        response: {
          failAction: 'ignore',
          status: {
            204: Joi.string().empty(''),
            400: erreurDoc,
            401: erreurDoc,
            403: erreurDoc,
          },
        },
        tags: ['api', 'complementary-certification', 'badges'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Elle permet de rattacher des résultats thématiques certifiants à une certification complémentaire',
        ],
      },
    },
  ]);
};

const name = 'attach-target-profile-api';
export { name, register };
