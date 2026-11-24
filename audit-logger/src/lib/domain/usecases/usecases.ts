import { auditLogPostgresRepository } from '../../infrastructure/repositories/audit-log-postgres.repository.js';
import { CreateAuditLogsUseCase } from './create-audit-logs.usecase.js';

const createAuditLogsUseCase = new CreateAuditLogsUseCase(auditLogPostgresRepository);

export { createAuditLogsUseCase };
