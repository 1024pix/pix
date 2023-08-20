import { auditLoggerRepository } from '../../repositories/audit-logger-repository.js';
import { UserAnonymizedEventLoggingJobScheduler } from '../../events/subscribers/audit-log/UserAnonymizedEventLoggingJobScheduler.js';

export class UserAnonymizedEventLoggingJobHandler {
  get name() {
    return UserAnonymizedEventLoggingJobScheduler.jobName;
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
