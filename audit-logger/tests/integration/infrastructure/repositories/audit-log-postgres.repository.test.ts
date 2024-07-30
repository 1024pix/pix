import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { knex } from '../../../../src/db/knex-database-connection.js';
import { AuditLog } from '../../../../src/lib/domain/models/audit-log.js';
import { auditLogPostgresRepository } from '../../../../src/lib/infrastructure/repositories/audit-log-postgres.repository.js';

describe('Integration | Infrastructure | Repositories | AuditLogPostgresRepository', () => {
  beforeEach(function () {
    vi.useFakeTimers({ now: new Date('2023-08-29') });
  });

  afterEach(async () => {
    vi.useRealTimers();
    await knex('audit-log').truncate();
  });

  describe('create', () => {
    test('creates new audit log', async () => {
      // given
      const auditLog = new AuditLog({
        occurredAt: new Date(),
        action: 'ANONYMIZATION',
        userId: '1',
        targetUserId: '2',
        client: 'PIX_ADMIN',
        role: 'SUPER_ADMIN',
      });

      // when
      await auditLogPostgresRepository.create(auditLog);

      // then
      const result = await knex('audit-log').first();
      const expectedResult = new AuditLog({
        id: '1',
        occurredAt: new Date(),
        action: 'ANONYMIZATION',
        userId: '1',
        targetUserId: '2',
        client: 'PIX_ADMIN',
        role: 'SUPER_ADMIN',
        createdAt: result.createdAt,
      });
      expect(result).toEqual(expectedResult);
    });
  });
});
