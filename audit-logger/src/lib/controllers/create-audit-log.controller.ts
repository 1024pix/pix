import { type Request, type ResponseObject, type ResponseToolkit, type ServerRoute } from '@hapi/hapi';
import Joi from 'joi';

import { type CreateAuditLogUseCase } from '../domain/usecases/create-audit-log.usecase.js';
import { type AuditLog } from '../domain/models/audit-log.js';
import { createAuditLogUseCase } from '../domain/usecases/usecases.js';
import { AuditLogActionTypes, AuditLogClientTypes, AuditLogRoleTypes } from '../domain/models/models.definition.js';

export class CreateAuditLogController {
  constructor(private readonly createAuditLogUseCase: CreateAuditLogUseCase) {}

  async handle(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
      const auditLog = request.payload as AuditLog;

      await this.createAuditLogUseCase.execute(auditLog);

    return h.response().code(204);
  }
}

const createAuditLogController=  new CreateAuditLogController(createAuditLogUseCase);

export const CREATE_AUDIT_LOG_ROUTE: ServerRoute = {
  method: 'POST',
  path: '/api/audit-logs',
  options: {
    auth: 'simple',
    handler: createAuditLogController.handle.bind(createAuditLogController),
    validate: {
      payload: Joi.object({
        targetUserId: Joi.string().required(),
        userId: Joi.string().required(),
        action: Joi.string().valid(...AuditLogActionTypes).required(),
        occurredAt: Joi.string().isoDate().required(),
        role: Joi.string().valid(...AuditLogRoleTypes).required(),
        client: Joi.string().valid(...AuditLogClientTypes).required(),
      }),
    },
  },
};
