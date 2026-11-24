import { type AuditLog } from '../models/audit-log.js';

export interface AuditLogRepository {
  createMany: (auditLogs: AuditLog[]) => Promise<void>;
}
