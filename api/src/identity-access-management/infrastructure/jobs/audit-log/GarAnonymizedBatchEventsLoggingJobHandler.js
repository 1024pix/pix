import { auditLoggerRepository } from '../../../../../lib/infrastructure/repositories/audit-logger-repository.js';
import { GarAnonymizedBatchEventsLoggingJob } from './GarAnonymizedBatchEventsLoggingJob.js';

const AUDIT_LOGGER_ANONYMIZATION_GAR_ACTION = 'ANONYMIZATION_GAR';

export class GarAnonymizedBatchEventsLoggingJobHandler {
  get name() {
    return GarAnonymizedBatchEventsLoggingJob.name;
  }

  async handle(event) {
    const { userIds: targetUserIds, updatedByUserId: userId, role, client, occurredAt } = event;

    const auditLoggerEvents = targetUserIds.map((targetUserId) => {
      return {
        targetUserId: targetUserId.toString(),
        userId: userId.toString(),
        role,
        client,
        occurredAt,
        action: AUDIT_LOGGER_ANONYMIZATION_GAR_ACTION,
      };
    });
    return auditLoggerRepository.logEvents(auditLoggerEvents);
  }
}
