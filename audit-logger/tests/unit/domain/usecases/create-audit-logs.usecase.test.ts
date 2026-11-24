import { describe, expect, test, vi } from 'vitest';

import { type AuditLogRepository } from '../../../../src/lib/domain/interfaces/audit-log.repository.js';
import { AuditLog } from '../../../../src/lib/domain/models/audit-log.js';
import { CreateAuditLogsUseCase } from '../../../../src/lib/domain/usecases/create-audit-logs.usecase.js';

describe('Unit | UseCases | Create audit logs', () => {
  describe('when audit logs are created', function () {
    test('creates all audit logs', async () => {
      // given
      const auditLogs = [
        new AuditLog({
          targetUserId: '2',
          userId: '3',
          action: 'ANONYMIZATION',
          occurredAt: new Date('2023-07-05'),
          role: 'SUPPORT',
          client: 'PIX_ADMIN',
        }),
        new AuditLog({
          targetUserId: '4',
          userId: '3',
          action: 'ANONYMIZATION',
          occurredAt: new Date('2023-07-05'),
          role: 'SUPPORT',
          client: 'PIX_ADMIN',
        }),
      ];

      const auditLogRepository: AuditLogRepository = {
        createMany: vi.fn(async () => {}),
      };

      const createAuditLogs = new CreateAuditLogsUseCase(auditLogRepository);

      // when
      await createAuditLogs.execute(auditLogs);

      // then
      expect(auditLogRepository.createMany).toBeCalledWith(auditLogs);
    });
  });
});
