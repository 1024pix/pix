import { type Request, type ResponseObject, type ResponseToolkit, type ServerRoute } from '@hapi/hapi';
import Joi from 'joi';

import { type AuditLog } from '../domain/models/audit-log.js';
import { AuditLogActionTypes, AuditLogClientTypes, AuditLogRoleTypes } from '../domain/models/models.definition.js';
import { type CreateAuditLogUseCase } from '../domain/usecases/create-audit-log.usecase.js';
import { createAuditLogUseCase } from '../domain/usecases/usecases.js';

const TWENTY_MEGABYTES = 1048576 * 20;

export class CreateAuditLogController {
  constructor(private readonly createAuditLogUseCase: CreateAuditLogUseCase) {}

  async handle(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    const auditLogs = request.payload as AuditLog[];

    await Promise.all(
      auditLogs.map(async (auditLog) => {
        await this.createAuditLogUseCase.execute(auditLog);
      }),
    );

    return h.response().code(204);
  }
}

const createAuditLogController = new CreateAuditLogController(createAuditLogUseCase);

export const CREATE_AUDIT_LOG_ROUTE: ServerRoute = {
  method: 'POST',
  path: '/api/audit-logs',
  options: {
    auth: 'simple',
    payload: {
      maxBytes: TWENTY_MEGABYTES,
    },
    handler: createAuditLogController.handle.bind(createAuditLogController),
    validate: {
      payload: Joi.array()
        .items(
          Joi.object({
            targetUserId: Joi.string().required(),
            userId: Joi.string().required(),
            action: Joi.string()
              .valid(...AuditLogActionTypes)
              .required(),
            occurredAt: Joi.string().isoDate().required(),
            role: Joi.string()
              .valid(...AuditLogRoleTypes)
              .required(),
            client: Joi.string()
              .valid(...AuditLogClientTypes)
              .required(),
          }),
        )
        .single(),
    },
  },
};
