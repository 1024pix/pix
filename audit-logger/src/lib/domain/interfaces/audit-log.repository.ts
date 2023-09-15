import { type AuditLog } from '../models/audit-log.js';

export interface AuditLogRepository {
  create: (auditLog: AuditLog) => Promise<void>;
}
