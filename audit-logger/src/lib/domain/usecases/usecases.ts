import { CreateAuditLogUseCase } from './create-audit-log.usecase.js';
import { auditLogPostgresRepository } from '../../infrastructure/repositories/audit-log-postgres.repository.js';

const createAuditLogUseCase = new CreateAuditLogUseCase(auditLogPostgresRepository);

export {
  createAuditLogUseCase,
};
