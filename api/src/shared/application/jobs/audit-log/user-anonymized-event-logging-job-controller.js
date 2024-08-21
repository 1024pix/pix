import { auditLoggerRepository } from '../../../../../lib/infrastructure/repositories/audit-logger-repository.js';
import { UserAnonymizedEventLoggingJob } from '../../../../identity-access-management/domain/models/UserAnonymizedEventLoggingJob.js';
import { JobController } from '../job-controller.js';

export class UserAnonymizedEventLoggingJobController extends JobController {
  constructor() {
    super(UserAnonymizedEventLoggingJob.name);
  }

  isJobEnabled() {
    return false;
  }

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
