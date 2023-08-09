import { describe, expect, vi, test } from 'vitest';
import { AuditLog } from '../../../../src/lib/domain/models/audit-log.js';
import { CreateAuditLogUseCase } from '../../../../src/lib/domain/usecases/create-audit-log.usecase.js';
import { type AuditLogRepository } from '../../../../src/lib/domain/interfaces/audit-log.repository.js';

describe('Unit | UseCases | Create audit log', () => {
  describe('when an audit log is created', function () {
    test('returns an audit log', async () => {
      // given
      const auditLog = new AuditLog({
        targetUserId: '2',
        userId: '3',
        action: 'ANONYMIZATION',
        occurredAt: new Date('2023-07-05'),
        role: 'SUPPORT',
        client: 'PIX_ADMIN',
      });

      const auditLogRepository: AuditLogRepository = {
        create: vi.fn(async () =>  {}),
      };

      const createAuditLog = new CreateAuditLogUseCase(auditLogRepository);

      // when
      await createAuditLog.execute(auditLog);

      // then
      expect(auditLogRepository.create).toBeCalledWith(auditLog);
    });
  });
});
