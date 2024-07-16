import Joi from 'joi';

import { AnswerStatus, KnowledgeElement } from '../../../../lib/domain/models/index.js';
import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { LOCALE } from '../../../shared/domain/constants.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { smartRandomSimulatorController } from './smart-random-simulator-controller.js';

const skillValidationObject = Joi.object({
  id: identifiersType.skillId,
  difficulty: Joi.number().integer().min(1).max(8).required(),
  name: Joi.string().required(),
});

const getNextChallengeRoute = {
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
            knowledgeElements: Joi.array()
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
                answerId: identifiersType.answerId,
                skillId: identifiersType.skillId,
              })
              .required(),
            answers: Joi.array()
              .items({
                id: Joi.number().required(),
                result: Joi.string()
                  .valid(
                    AnswerStatus.statuses.OK,
                    AnswerStatus.statuses.KO,
                    AnswerStatus.statuses.SKIPPED,
                    AnswerStatus.statuses.FOCUSEDOUT,
                  )
                  .required(),
                challengeId: identifiersType.challengeId,
              })
              .required(),
            skills: Joi.array().items(skillValidationObject).min(1).required(),
            challenges: Joi.array()
              .items({
                id: identifiersType.challengeId,
                skill: skillValidationObject.required(),
                timer: Joi.number().integer(),
                focused: Joi.boolean().optional(),
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
              .min(1)
              .required(),
            locale: Joi.string()
              .valid(LOCALE.FRENCH_FRANCE, LOCALE.FRENCH_SPOKEN, LOCALE.ENGLISH_SPOKEN, LOCALE.DUTCH_SPOKEN)
              .required(),
            assessmentId: identifiersType.assessmentId,
          },
        },
      }),
      options: {
        allowUnknown: true,
      },
    },
    handler: smartRandomSimulatorController.getNextChallenge,
    notes: [
      '- **Route nécessitant une authentification**\n' +
        "- Cette route permet d'appeler le simulateur d'algorithme de sélection des épreuves Smart Random.",
    ],
    tags: ['api', 'admin', 'smart-random-simulator'],
  },
};

const getCampaignParametersRoute = {
  method: 'GET',
  path: '/api/admin/smart-random-simulator/campaign-parameters/{locale}/{campaignId}',
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
        locale: Joi.string()
          .required()
          .valid(...[LOCALE.ENGLISH_SPOKEN, LOCALE.FRENCH_FRANCE, LOCALE.FRENCH_SPOKEN, LOCALE.DUTCH_SPOKEN]),
        campaignId: Joi.string().required(),
      }),
    },
    handler: smartRandomSimulatorController.getInputValuesForCampaign,
    notes: [
      '- **Route nécessitant une authentification**\n' +
        "- Cette route permet de récupérer les données d'entrée d'une campagne pour nourrir le simulateur",
    ],
    tags: ['api', 'admin', 'smart-random-simulator'],
  },
};
const register = async function (server) {
  server.route([getNextChallengeRoute, getCampaignParametersRoute]);
};

const name = 'smart-random-simulator-api';
export { name, register };
