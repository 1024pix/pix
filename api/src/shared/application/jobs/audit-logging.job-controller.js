import { AuditLoggingJob } from '../../domain/models/jobs/AuditLoggingJob.js';
import { auditLoggerRepository } from '../../infrastructure/repositories/audit-logger-repository.js';
import { JobController, JobTeam } from './job-controller.js';

export class AuditLoggingJobController extends JobController {
  constructor() {
    super(AuditLoggingJob.name, {
      description:
        "Envoie au service d'audit (audit-logger) les événements d'actions sensibles réalisées sur des utilisateurs (anonymisation, changement d'email, suppression de participations…), un événement par utilisateur ciblé.",
      team: JobTeam.ACCES,
    });
  }

  async handle({ data: jobData, dependencies = { auditLoggerRepository } }) {
    const { client, action, role, userId, targetUserIds, data, occurredAt } = jobData;

    const auditLoggerEvents = targetUserIds.map((targetUserId) => {
      return {
        client,
        action,
        role,
        userId: userId.toString(),
        targetUserId: targetUserId.toString(),
        data,
        occurredAt,
      };
    });

    return dependencies.auditLoggerRepository.logEvents(auditLoggerEvents);
  }
}
