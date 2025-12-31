import JoiDate from '@joi/date';
import BaseJoi from 'joi';

const Joi = BaseJoi.extend(JoiDate);

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { SCOPES } from '../../shared/domain/models/Scopes.js';
import { certificationVersionController } from './certification-version-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/certification-versions/{scope}/active',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([securityPreHandlers.checkAdminMemberHasRoleSuperAdmin])(
                request,
                h,
              ),
            assign: 'hasRoleSuperAdmin',
          },
        ],
        validate: {
          params: Joi.object({
            scope: Joi.string()
              .required()
              .valid(...Object.values(SCOPES)),
          }),
        },
        handler: certificationVersionController.getActiveVersionByScope,
        tags: ['api', 'admin'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin',
          'Elle permet de récupérer la version active de certification pour un scope donné',
        ],
      },
    },
    {
      method: 'PATCH',
      path: '/api/admin/certification-versions/{certificationVersionId}',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([securityPreHandlers.checkAdminMemberHasRoleSuperAdmin])(
                request,
                h,
              ),
            assign: 'hasRoleSuperAdmin',
          },
          {
            method: (request, h) => {
              const urlId = request.params.certificationVersionId;
              const payloadId = request.payload.data.id;

              if (urlId !== payloadId) {
                return h
                  .response({ message: 'Payload data.id must match URL certificationVersionId' })
                  .code(400)
                  .takeover();
              }

              return h.continue;
            },
            assign: 'validateIdConsistency',
          },
        ],
        validate: {
          params: Joi.object({
            certificationVersionId: identifiersType.certificationVersionId,
          }),
          payload: Joi.object({
            data: {
              id: identifiersType.certificationVersionId.required(),
              type: Joi.string().valid('certification-versions').required(),
              attributes: {
                scope: Joi.string()
                  .required()
                  .valid(...Object.values(SCOPES)),
                'start-date': Joi.date().required(),
                'expiration-date': Joi.date().allow(null).optional(),
                'assessment-duration': Joi.number().integer().min(0).required(),
                'global-scoring-configuration': Joi.array().allow(null).optional(),
                'competences-scoring-configuration': Joi.array().allow(null).optional(),
                'challenges-configuration': Joi.object({
                  maximumAssessmentLength: Joi.number().integer().min(0),
                  challengesBetweenSameCompetence: Joi.number().integer().min(0).required(),
                  limitToOneQuestionPerTube: Joi.boolean(),
                  enablePassageByAllCompetences: Joi.boolean(),
                  variationPercent: Joi.number().min(0).max(1),
                  defaultCandidateCapacity: Joi.number().required(),
                  defaultProbabilityToPickChallenge: Joi.number().min(0).max(100).required(),
                }).required(),
              },
            },
          }),
        },
        handler: certificationVersionController.updateCertificationVersion,
        tags: ['api', 'admin'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin',
          'Elle permet de mettre à jour une version de certification',
        ],
      },
    },
  ]);
};

const name = 'certification-versions-api';
export { name, register };
