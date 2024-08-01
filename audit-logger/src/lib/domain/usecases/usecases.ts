import { auditLogPostgresRepository } from '../../infrastructure/repositories/audit-log-postgres.repository.js';
import { CreateAuditLogUseCase } from './create-audit-log.usecase.js';

const createAuditLogUseCase = new CreateAuditLogUseCase(auditLogPostgresRepository);

export { createAuditLogUseCase };
