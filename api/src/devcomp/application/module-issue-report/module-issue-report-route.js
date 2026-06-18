import Joi from 'joi';

import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { handlerWithDependencies } from '../../infrastructure/utils/handlerWithDependencies.js';
import { moduleIssueReportController } from './module-issue-report-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/module-issue-reports',
      config: {
        auth: false,
        handler: handlerWithDependencies(moduleIssueReportController.createModuleIssueReport),
        validate: {
          payload: Joi.object({
            data: Joi.object({
              type: Joi.string().valid('module-issue-reports').required(),
              attributes: Joi.object({
                'module-id': identifiersType.moduleId,
                'element-id': identifiersType.elementId,
                'passage-id': identifiersType.passageId,
                answer: Joi.string().allow('').allow(null).optional(),
                'category-key': Joi.string().required(),
                comment: Joi.string().required(),
              }).required(),
            }).required(),
          }).required(),
        },
        notes: ["- Permet à l'utilisateur d'envoyer un signalement pour un module donné"],
        tags: ['api', 'modules', 'module-issue-reports'],
      },
    },
  ]);
};

export const moduleIssueReportRoute = { name: 'devcomp/module-issue-report-api', register };
