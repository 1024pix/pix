import { auditLoggerRepository } from '../../repositories/audit-logger-repository.js';
import { UserAnonymizedBatchEventsLoggingJob } from './UserAnonymizedBatchEventsLoggingJob.js';

export class UserAnonymizedBatchEventsLoggingJobHandler {
  get name() {
    return UserAnonymizedBatchEventsLoggingJob.name;
  }

  async handle(events = []) {
    return auditLoggerRepository.logEvents(
      events.map((event) => {
        const { userId: targetUserId, updatedByUserId: userId, role, client, occurredAt } = event;
        return {
          targetUserId: targetUserId.toString(),
          userId: userId.toString(),
          role,
          client,
          occurredAt,
          action: 'ANONYMIZATION',
        };
      }),
    );
  }
}
