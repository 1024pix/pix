import { type Request, type ResponseObject, type ResponseToolkit, type ServerRoute } from '@hapi/hapi';
import Joi from 'joi';

import { type AuditLog } from '../domain/models/audit-log.js';
import { type CreateAuditLogsUseCase } from '../domain/usecases/create-audit-logs.usecase.js';
import { createAuditLogsUseCase } from '../domain/usecases/usecases.js';

const TWENTY_MEGABYTES = 1048576 * 20;

export class CreateAuditLogController {
  constructor(private readonly createAuditLogsUseCase: CreateAuditLogsUseCase) {}

  async handle(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    const auditLogs = request.payload as AuditLog[];

    await this.createAuditLogsUseCase.execute(auditLogs);

    return h.response().code(204);
  }
}

const createAuditLogController = new CreateAuditLogController(createAuditLogsUseCase);

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
            action: Joi.string().required(),
            occurredAt: Joi.string().isoDate().required(),
            role: Joi.string().required(),
            client: Joi.string().required(),
            data: Joi.object().optional(),
          }),
        )
        .single(),
    },
  },
};
