import { auditLoggerRepository } from '../../../../../lib/infrastructure/repositories/audit-logger-repository.js';

export class UserAnonymizedEventLoggingJobController {
  async handle(UserAnonymizedEventLoggingJob) {
    const { userId: targetUserId, updatedByUserId: userId, role, client, occurredAt } = UserAnonymizedEventLoggingJob;

    // TODO: a mettre dans un usecases
    return auditLoggerRepository.logEvent({
      targetUserId: targetUserId.toString(),
      userId: userId.toString(),
      role,
      client,
      occurredAt,
      action: 'ANONYMIZATION',
    });
  }
}
