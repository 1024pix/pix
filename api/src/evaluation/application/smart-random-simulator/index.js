import Joi from 'joi';
import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { smartRandomSimulatorController } from './smart-random-simulator-controller.js';
import { AnswerStatus, KnowledgeElement } from '../../../../lib/domain/models/index.js';
import { LOCALE } from '../../../shared/domain/constants.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/smart-random-simulator/get-next-challenge',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          payload: Joi.object({
            data: {
              attributes: {
                'knowledge-elements': Joi.array()
                  .items({
                    source: Joi.string()
                      .valid(KnowledgeElement.SourceType.DIRECT, KnowledgeElement.SourceType.INFERRED)
                      .required(),
                    status: Joi.string()
                      .valid(
                        KnowledgeElement.StatusType.VALIDATED,
                        KnowledgeElement.StatusType.INVALIDATED,
                        KnowledgeElement.StatusType.RESET,
                      )
                      .required(),
                    'answer-id': identifiersType.answerId,
                    'skill-id': identifiersType.skillId,
                  })
                  .min(1)
                  .required(),
                answers: Joi.array().items({
                  result: Joi.string()
                    .valid(
                      AnswerStatus.statuses.OK,
                      AnswerStatus.statuses.KO,
                      AnswerStatus.statuses.SKIPPED,
                      AnswerStatus.statuses.FOCUSEDOUT,
                      AnswerStatus.statuses.PARTIALLY,
                    )
                    .required(),
                  'challenge-id': identifiersType.challengeId,
                }),
                skills: Joi.array()
                  .items({
                    id: identifiersType.skillId,
                    difficulty: Joi.number().integer().min(1).max(8).required(),
                    name: Joi.string().required(),
                  })
                  .required(),
                challenges: Joi.array()
                  .items({
                    id: identifiersType.challengeId,
                    skill: {
                      id: identifiersType.skillId,
                      name: Joi.string().required(),
                    },
                    locales: Joi.array()
                      .items(
                        Joi.string().valid(
                          LOCALE.FRENCH_FRANCE,
                          LOCALE.FRENCH_SPOKEN,
                          LOCALE.ENGLISH_SPOKEN,
                          LOCALE.DUTCH_SPOKEN,
                        ),
                      )
                      .required(),
                  })
                  .required(),
                locale: Joi.string()
                  .valid(LOCALE.FRENCH_FRANCE, LOCALE.FRENCH_SPOKEN, LOCALE.ENGLISH_SPOKEN, LOCALE.DUTCH_SPOKEN)
                  .required(),
                'assessment-id': identifiersType.assessmentId,
              },
            },
          }),
        },
        handler: smartRandomSimulatorController.getNextChallenge,
        notes: [
          '- **Route nécessitant une authentification**\n' +
            "- Cette route permet d'appeler le simulateur d'algorithme de sélection des épreuves Smart Random.",
        ],
        tags: ['api', 'admin', 'smart-random-simulator'],
      },
    },
  ]);
};

const name = 'smart-random-simulator-api';
export { register, name };
