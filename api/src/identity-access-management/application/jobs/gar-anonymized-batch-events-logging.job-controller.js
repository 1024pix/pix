import { auditLoggerRepository } from '../../../../lib/infrastructure/repositories/audit-logger-repository.js';
import { JobController } from '../../../shared/application/jobs/job-controller.js';
import { GarAnonymizedBatchEventsLoggingJob } from '../../domain/models/GarAnonymizedBatchEventsLoggingJob.js';

const AUDIT_LOGGER_ANONYMIZATION_GAR_ACTION = 'ANONYMIZATION_GAR';

export class GarAnonymizedBatchEventsLoggingJobController extends JobController {
  constructor() {
    super(GarAnonymizedBatchEventsLoggingJob.name);
  }

  async handle({
    data,
    dependencies = {
      auditLoggerRepository,
    },
  }) {
    const { userIds: targetUserIds, updatedByUserId: userId, role, client, occurredAt } = data;

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
