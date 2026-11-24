import { type AuditLogRepository } from '../interfaces/audit-log.repository.js';
import { type AuditLog } from '../models/audit-log.js';

export class CreateAuditLogsUseCase {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  async execute(auditLogs: AuditLog[]): Promise<void> {
    await this.auditLogRepository.createMany(auditLogs);
  }
}
