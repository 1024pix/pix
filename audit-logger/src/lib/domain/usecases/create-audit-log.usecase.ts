import { type AuditLogRepository } from '../interfaces/audit-log.repository.js';
import { type AuditLog } from '../models/audit-log.js';

export class CreateAuditLogUseCase {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  async execute(auditLog: AuditLog): Promise<void> {
    await this.auditLogRepository.create(auditLog);
  }
}
