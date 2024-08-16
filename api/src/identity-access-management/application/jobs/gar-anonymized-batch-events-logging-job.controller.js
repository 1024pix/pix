import { auditLoggerRepository } from '../../../../lib/infrastructure/repositories/audit-logger-repository.js';
import { GarAnonymizedBatchEventsLoggingJob } from '../../domain/models/GarAnonymizedBatchEventsLoggingJob.js';

const AUDIT_LOGGER_ANONYMIZATION_GAR_ACTION = 'ANONYMIZATION_GAR';

export class GarAnonymizedBatchEventsLoggingJobController {
  get name() {
    return GarAnonymizedBatchEventsLoggingJob.name;
  }

  async handle(
    event,
    dependencies = {
      auditLoggerRepository,
    },
  ) {
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
    return dependencies.auditLoggerRepository.logEvents(auditLoggerEvents);
  }
}
