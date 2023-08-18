import { UserAnonymizedEventLoggingJob } from './UserAnonymizedEventLoggingJob.js';
import { auditLoggerRepository } from '../../repositories/audit-logger-repository.js';

export class UserAnonymizedEventLoggingJobHandler {
  get name() {
    return UserAnonymizedEventLoggingJob.name;
  }

  async handle(event) {
    const { userId: targetUserId, updatedByUserId: userId, role, client, occurredAt } = event;
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
