import { knex } from '../../../db/knex-database-connection.js';
import { type AuditLogRepository } from '../../domain/interfaces/audit-log.repository.js';
import { type AuditLog } from '../../domain/models/audit-log.js';

export class AuditLogPostgresRepository implements AuditLogRepository {
  async create(auditLog: AuditLog): Promise<void> {
    await knex('audit-log').insert(auditLog);
  }
}

export const auditLogPostgresRepository = new AuditLogPostgresRepository();
