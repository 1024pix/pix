import { knex } from '../../../db/knex-database-connection.js';
import { type AuditLogRepository } from '../../domain/interfaces/audit-log.repository.js';
import { type AuditLog } from '../../domain/models/audit-log.js';

const BATCH_SIZE = 1000;

export class AuditLogPostgresRepository implements AuditLogRepository {
  async createMany(auditLogs: AuditLog[]): Promise<void> {
    await knex.batchInsert('audit-log', auditLogs, BATCH_SIZE);
  }
}

export const auditLogPostgresRepository = new AuditLogPostgresRepository();
