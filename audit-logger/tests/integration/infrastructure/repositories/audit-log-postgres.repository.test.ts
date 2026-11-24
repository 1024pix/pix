import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { knex } from '../../../../src/db/knex-database-connection.js';
import { AuditLog } from '../../../../src/lib/domain/models/audit-log.js';
import { auditLogPostgresRepository } from '../../../../src/lib/infrastructure/repositories/audit-log-postgres.repository.js';

describe('Integration | Infrastructure | Repositories | AuditLogPostgresRepository', () => {
  beforeEach(function () {
    vi.useFakeTimers({ now: new Date('2023-08-29'), toFake: ['Date'] });
  });

  afterEach(async () => {
    vi.useRealTimers();
    await knex('audit-log').truncate();
  });

  describe('createMany', () => {
    test('creates new audit logs', async () => {
      // given
      const auditLogs = [
        new AuditLog({
          occurredAt: new Date(),
          action: 'ANONYMIZATION',
          userId: '1',
          targetUserId: '2',
          client: 'PIX_ADMIN',
          role: 'SUPER_ADMIN',
        }),
        new AuditLog({
          occurredAt: new Date(),
          action: 'ANONYMIZATION',
          userId: '1',
          targetUserId: '3',
          client: 'PIX_ADMIN',
          role: 'SUPER_ADMIN',
        }),
      ];

      // when
      await auditLogPostgresRepository.createMany(auditLogs);

      // then
      const results = await knex('audit-log').orderBy('targetUserId');
      expect(results).toEqual([
        new AuditLog({
          id: '1',
          occurredAt: new Date(),
          action: 'ANONYMIZATION',
          userId: '1',
          targetUserId: '2',
          client: 'PIX_ADMIN',
          role: 'SUPER_ADMIN',
          data: null,
          createdAt: results[0].createdAt,
        }),
        new AuditLog({
          id: '2',
          occurredAt: new Date(),
          action: 'ANONYMIZATION',
          userId: '1',
          targetUserId: '3',
          client: 'PIX_ADMIN',
          role: 'SUPER_ADMIN',
          data: null,
          createdAt: results[1].createdAt,
        }),
      ]);
    });

    describe('when data is specified', () => {
      test('creates new audit logs with data', async () => {
        // given
        const auditLog = new AuditLog({
          occurredAt: new Date(),
          action: 'ANONYMIZATION',
          userId: '1',
          targetUserId: '2',
          client: 'PIX_ADMIN',
          role: 'SUPER_ADMIN',
          data: { hello: 'world' },
        });

        // when
        await auditLogPostgresRepository.createMany([auditLog]);

        // then
        const result = await knex('audit-log').first();
        expect(result.data).toEqual({ hello: 'world' });
      });
    });
  });
});
